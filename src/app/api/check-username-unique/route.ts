import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";


const UsernameQuerySchema  = z.object({
    username: usernameValidation
})

export async function GET(request: Request){
    await dbConnect();

    try {
        const {searchParams} = new URL(request.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log(result)
        if(!result.success){
            const usernameError = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: "Invalid username",
                }, {status: 400})
        }

        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})
        if(!existingVerifiedUser){
            return Response.json(
                {
                    success: false,
                    message: "Username not found",
                }, {status: 404})
         }
            return Response.json(
                {
                    success: true,
                    message: "Username is unique",
                }, {status: 404})
        
    } catch (error) {
        console.error( "Error checking username",  error);
        return Response.json(
            {
                success: false,
                message: "Error checking"
            }, {status: 500}
        )
    }
}