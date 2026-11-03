// ??? Разобраться с этим. Предполагается использование в me вместо @Req

// import { createParamDecorator, ExecutionContext } from "@nestjs/common";
// import { User } from "../../generated/prisma/client.js";
// import { Request } from "express";

// export const Authorized = createParamDecorator(
//     (data: keyof User, context: ExecutionContext) => {
//         const request = context.switchToHttp().getRequest() as Request

//         const user = request.user

//         return data ? user![data] : user 
//     }


// )