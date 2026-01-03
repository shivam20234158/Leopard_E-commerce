import Product from "../models/product.model.js";


export const addToCart=async (req,res)=>{
    try{
        const {productId}=req.body;
        const user=req.user;//we get it from the res.user in protect route

        const existingItem=user.cartItems.find(item=>item.id==productId);

        if(existingItem){
            existingItem.quantity+=1;
        }
        else{
            user.cartItems.push(productId);
        }

        await user.save();
        res.json(user.cartItems);
    }
    catch(error){
        console.log("Error in addToCart controller",error.message);
        res.status(500).json({message:"Server Error",error:error.meassage});
    }
}
export const removeAllFromCart=async (req,res)=>{
    try{
        const {productId}=req.body;
        const user=req.user;
        if(!productId){
            user.cartItems=[];
        }
        //filter only the item that dont match
        else{
            user.cartItems=user.cartItems.filter((item)=>item.id!==productId);
        }
        await user.save();
        res.json(user.cartItems);
    }
    catch(error){
        console.log("Error in removeAllFromCart controller",error.message);
        res.status(500).json({message:"Server Error",error:error.meassage});
    }
}
export const updateQuantity=async(req,res)=>{
    try{
        const {id:productId}=req.params;
        const {quantity}=req.body;
        const user=req.user;
        const existingItem=user.cartItems.find((item)=>item.id===productId);
        if(existingItem){
            //remove from the items
            if(quantity===0){
                user.cartItems=user.cartItems.filter((item)=>item.id!==productId);
                await user.save();
                return res.json(user.cartItems);
            }
            else{
                existingItem.quantity=quantity;
                await user.save();
                return res.json(user.cartItems);
            }
        }
    }
    catch(error){
        console.log("Error in removeAllFromCart controller",error.message);
        res.status(500).json({message:"Server Error",error:error.meassage});
    }
}
export const getCartProducts=async (req,res)=>{
    try{
        //from the model cartItems se Id milegi
        const products=await Product.find({_id:{$in:req.user.cartItems}});

        //go into each product
        const cartItems=products.map(product=>{
            const item=req.user.cartItems.find(cartItem=>cartItem.id===product.id);
            return {...product.toJSON(),quantity:item.quantity}
        })
        res.json(cartItems);
    }
    catch(error){
        console.log("Error in getCartProducts controller",error.message);
        res.status(500).json({message:"Server Error",error:error.meassage});
    }
}