import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request){
    await dbConnect();

    try {
        const {username, code} = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({username: decodedUsername})
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "Invalid code",
                }, {status: 400})
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "Account Verified"
                }, {status: 200}
            )
        } else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: true,
                    message: "code expired"
                }, {status: 400}
            )
        } else{
            return Response.json(
                {
                    success: true,
                    message: "Incorrect code"
                }, {status: 400}
            )
        }
    }catch (error) {
        console.error( "Error checking code",  error);
        return Response.json(
            {
                success: false,
                message: "Error checking"
            }, {status: 500}
        )
    }
}