import type { Response } from "express";

// Small helper so every controller returns the same JSON error shape.
export function sendError(res: Response, error: unknown, fallbackMessage: string) {
    const code = (error as { code?: string })?.code;

    if (code === "P2002") {
        return res.status(409).json({
            success: false,
            message: "This record already exists",
        });
    }

    if (code === "P2025") {
        return res.status(404).json({
            success: false,
            message: "Record not found",
        });
    }

    if (code === "P2003") {
        return res.status(400).json({
            success: false,
            message: "Invalid reference to another record",
        });
    }

    console.error(fallbackMessage, error);
    return res.status(500).json({
        success: false,
        message: fallbackMessage,
    });
}

export function isPositiveInt(value: number) {
    return Number.isInteger(value) && value > 0;
}
