import type { Request, Response } from "express";
import { createOrgSchema } from "../types";
import { prisma_client } from "database";


export const create_org = async (req: Request, res: Response) => {
    const parsedInput = createOrgSchema.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({
            success: false,
            errors: parsedInput.error.issues,
            message: "Validation error creating organization",
        });
    }

    const { name, description } = parsedInput.data;

    try {

        await prisma_client.organization.create({
            data: {
                name: name,
                description: description,

            }
        })

        return res.status(200).json({
            success: true,
            message: "Organization created successfully",

        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error creating organization",
        })
    }

}

export const get_org = async (req: Request, res: Response) => {

}

export const delete_org = async (req: Request, res: Response) => {

}

export const add_member = async (req: Request, res: Response) => {

}

export const remove_member = async (req: Request, res: Response) => {

}

export const remove_memberorgID = async (req: Request, res: Response) => {

}


