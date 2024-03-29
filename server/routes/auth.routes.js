import {Router} from "express";
import {User} from "../models/mapping.js";
import bcrypt from "bcrypt";
import {check, validationResult} from "express-validator";
import config from "config";
import jwt from "jsonwebtoken";
import {where} from "sequelize";
import authMiddleware from '../middleware/auth.middleware.js'

const router = new Router()


router.post('/registration',
    [
    check('email', "Uncorrected email").isEmail(),
    check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    async (req,res)=>{
    try {
        console.log(req.body)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrected request", errors})
        }
        const {email, password, name, surname} = req.body
        const candidate = await User.findOne({where:{email: email}})
        if(candidate){
            return res.status(400).json({message:`User with email ${email} already exist`})
        }
        const hashPassword = await bcrypt.hash(password, 7)
        const user = new User({email, password: hashPassword, name, surname})
        await user.save()
        return res.json({message: "User was created"})
    }catch (e){
        console.log(e)
        res.send({message:"Server error"})
    }
})

router.post('/login',
    async (req,res)=>{
        try {
           const{email, password} = req.body
            const user = await User.findOne({where:{email: email}})
            if (!User){
                return res.status(400).json({message:"User nof found"})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid){
                return res.status(400).json({message:"Invalid password"})
            }
            const token = jwt.sign({id:user.id, role:user.role}, config.get("secretKey"),{expiresIn: "1h"})

            return res.json({
                token,
                user:{
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                    role: user.role,
                }
            })
        }catch (e){
            console.log(e)
            res.send({message:"Server error"})
        }
    })

router.get('/auth', authMiddleware,
    async (req,res)=>{
        try {
            const user = await User.findOne({where:{id: req.user.id}})
            const token = jwt.sign({id: user.id, role:user.role}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                    role:user.role
                }
            })
        }catch (e){
            console.log(e)
            res.send({message:"Server error"})
        }
    })

export default router