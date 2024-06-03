'use server'

import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "../appwrite";
import { parseStringify } from "../utils";

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
  