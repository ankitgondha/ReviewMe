import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { string } from "zod";
import { NextResponse } from 'next/server';

export async function POST(request: Request){
    await dbConnect();

    try {
        console.log("Ankit")
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })
        if(existingUserVerifiedByUsername){
            return NextResponse.json(
                {
                    success: false,
                    message: "Username already exists"
                },
                {
                    status: 400
                }
            )
        }

        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return NextResponse.json(
                    {
                        success: false,
                        message: "Email already exists"
                    },
                    {
                        status: 400
                    }
                )
            }
            else{
                const hasedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hasedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date();
                existingUserByEmail.verifyCodeExpiry.setHours(existingUserByEmail.verifyCodeExpiry.getHours() + 1);
                await existingUserByEmail.save();
            }
        }
        else{
            const hasedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hasedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save();
        }
        const emailresponse = await sendVerificationEmail(email, username, verifyCode);
        if(!emailresponse.success){
            return Response.json(
                {
                    success: false,
                    message: emailresponse.message
                },
                {
                    status: 500
                }
            )
        }
        
        
        return NextResponse.json({
            success: true,
            message: "User Created Successfully. Please verify your email"
        }, {status: 201})

    } catch (error) {
        console.log("Helooooooooooooooooooooo it error");
        console.error('Error Signing Up: ', error);
        return NextResponse.json(
            {
                success: false,
                message: "Error Signing Up"
            },
            {
                status: 500
            }
        )
    }
}