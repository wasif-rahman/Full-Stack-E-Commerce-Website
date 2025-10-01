import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as cartservice from "../services/cart.services.js";


export const addItemToCart =asyncHandler(async(req:Request, res:Response)=>{
    const {productId,quantity}= req.body;
    const userId = req.user?.id; 
    const item = await cartservice.addItemToCartService(userId!,productId,quantity|| 1);
    res.status(201).json({success:true,data:item});
  
});
export const updateCartItem = asyncHandler(async(req:Request , res:Response)=>{
    const { productId,quantity} = req.body;
    const userId = req.user?.id;
    const item =  await cartservice.updateCartItemService(userId!, productId,quantity)
    res.json({success:true,data:item})
});
export const removeCartItem = asyncHandler(async(req: Request, res:Response)=>{
    const {productId} = req.body;
    const userId= req.user?.id;
const deleted= await cartservice.removeCartItemsService(userId!,productId)
res.json({success:true,data:deleted})

});
export const clearUserCart = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?.id;
    const  empty= await cartservice.clearUserCartService(userId!)
    res.json({success:true,data: empty})
});
export const getUserCart = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?.id;
    const cart = await cartservice.getUserCartService(userId! )
    res.json({success:true, count:cart.length,data:cart})
});
