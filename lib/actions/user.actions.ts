'use server'

import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "../appwrite";
import { encryptId, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource } from "./dwolla.actions";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLEECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
}=process.env;

//try catch for async functions
export const signIn=async({email, password}: signInProps)=>{
    try {
        //Mutation/Database/make fetch
        const { account } = await createAdminClient();
        const response=await account.createEmailPasswordSession(email, password); 
        return parseStringify(response);
    } catch (error) {
        console.error('Error', error);
    }
}

export const signUp=async(userData: SignUpParams)=>{
    //destructuring syntax
    const {email, password, firstName, lastName}=userData
    try {
        //Mutation/Database/make fetch
        const { account } = await createAdminClient();

        const newUserAccount=await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );
        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        });
        return parseStringify(newUserAccount)
    } catch (error) {
        console.error('Error', error);
    }
} 

// ... your initilization functions just like the is user authenticated flag

export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const user=await account.get();
      return parseStringify(user);
    } catch (error) {
      return null;
    }
  }

export const logoutAccount=async()=>{
    try{
        const {account}=await createSessionClient();
        cookies().delete('appwrite-session');
        await account.deleteSession('current');
    }catch (error){
        return null;
    }
}

export const createLinkToken=async (user: User)=>{
    try{
        const tokenParams={
            user:{
                client_user_id: user.$id
            },
            client_name: user.name,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }
        const response=await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({linkToken: response.data.link_token})
    } catch(error){
        console.log(error);
    }
}

export const createBankAccount=async({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId,
}: createBankAccountProps)=>{
    try{
        const {database}=await createAdminClient();
        const bankAccount=await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId,
            }
        )
        return parseStringify(bankAccount);
    }catch(error){
        console.log(error);
    }
}

export const createPublicToken=async({
    publicToken,
    user,
}: exchangePublicTokenProps)=>{
    try{
        //exchange public token for access token and item ID
        const response=await plaidClient.itemPublicTokenExchange({public_token: publicToken,});

        const accessToken=response.data.access_token;
        const itemId=response.data.item_id;

        //Get account information from Plaid using the access token

        const accountResponse=await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData=accountResponse.data.accounts[0];

        //Create a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest={
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse=await plaidClient.processorTokenCreate(request);
        const processorToken=processorTokenResponse.data.processor_token;

        //create a funding source URL for the account using the Dwolla customer ID, 
        //processor token, and bank name
        const fundingSourceUrl=await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        //if the funding source URL is not created, throw an error
        if(!fundingSourceUrl) throw Error;

        //Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and sharable ID
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        });

        //Revalidate the path to reflect the changes
        revalidatePath("/");

        //Return a success message
        return parseStringify({
            publicTokenExchange: "complete",
        })

    }catch(error){
        console.error('An error occurred while creating exchanging token', error);
    }
}
   
