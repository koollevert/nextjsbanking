"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"


import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import CustomInput from "./CustomInput"
import { authFormSchema } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getLoggedInUser, signIn, signUp } from "@/lib/actions/user.actions"

const AuthForm = ({type}: {type: string}) => {
  const router = useRouter()
  const [user, setUser]=useState(null);
  const [isloading, setIsLoading]=useState(false);

  const formSchema=authFormSchema(type)
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })
 
  // 2. Define a submit handler.
  const onSubmit=async(data: z.infer<typeof formSchema>)=> {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setIsLoading(true)
    try {
      //Sign up with Appwrite & create plaid token
      if(type==='Sign-up'){
        const newUser= await signUp(data);
        setUser(newUser);

      }
      if(type==='Sign-in'){
        const response = await signIn({
          email: data.email,
          password: data.password,
        })
        if(response) router.push('/')

      }
      
    } catch (error) {
      console.log(error)
    }finally{
      setIsLoading(false)
    }
  }
  return (
    <section className='auth-form'>
      <header className='flex flex-col gap-5 md:gap-8'>
        <Link href="/" className=' cursor-pointer flex items-center gap-1'>

          <Image src='/icons/logo.svg' width={34} height={34} alt="Horizon logo"/>
          <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>
              Bankiko
          </h1>
        </Link>
        <div className='flex flex-col gap-1 md:gap-3'>
          <h1>
            {user
              ?'link Account'
              : type==='Sign-in'
                ?'Sign In'
                :'Sign Up'
            }
            <p className='text-16 font-normal text-gray-600'>
              {user //if we have a user
                ? 'Link your account to get started' //then lets link your bank account
                : 'Please enter you details' //else
              }
            </p>
          </h1>
        </div>
        </header>
      {user ? (
        <div className='flex flex-col gap-4'>
          {/*PlaidLink*/}
        </div>
      ):(
        <>
          <Form {...form}> 
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type==='Sign-up' &&(
                <>
                  <div className="flex gap-4">
                    <CustomInput control={form.control} name='firstName' label="First Name" placeholder='Enter your first name'/>
                    <CustomInput control={form.control} name='lastName' label="Last Name" placeholder='Enter your last name'/>
                  </div>

                  <div className="flex gap-4">
                    <CustomInput control={form.control} name='state' label="State" placeholder='Example: NY'/>
                    <CustomInput control={form.control} name='postalCode' label="Postal Code" placeholder='Example: 00100'/>
                  </div>

                  <div className="flex gap-4">
                    <CustomInput control={form.control} name='dateOfBirth' label="Date of Birth" placeholder='YYYY-MM-DD'/>
                    <CustomInput control={form.control} name='ssn' label="SSN" placeholder='Example: 1234'/>
                  </div>
                    <CustomInput control={form.control} name='address1' label="Address" placeholder='Enter your specific address'/> 
                    <CustomInput control={form.control} name='city' label="City" placeholder='Enter your city'/>                   
                </>
              )}
             
              <CustomInput control={form.control} name='email' label="Email" placeholder='Enter your email'/>
              <CustomInput control={form.control} name='password' label="Password" placeholder='Enter your password'/>

              <div className="flex flex-col gap-4">
                <Button type="submit" className="form-btn" disabled={isloading}>
                  {isloading?(
                    <>
                    <Loader2 size={20}
                    className="animate-spin"/> &nbsp;
                    Loading...
                    </>
                  ) : type==='Sign-in'
                    ? 'Sign In': 'Sign Up'
                  }
                </Button>
              </div>
            </form>
          </Form>
          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type ==="Sign-in" ? "Don't have an account?" : "Already have an"}
            </p>
            <Link href={type==='Sign-in' ? '/sign-up' : 'sign-in'} className="form-link">
              {type==="Sign-in" ? "Sign up": "Sign in"}
            </Link>
          </footer>
        </>

      )}
      
    </section>
  )
}

export default AuthForm