import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';
import crypto from 'crypto';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request:  NextRequest) {
  try {
    const body = await request. json();
    
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto. createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status:  400 }
      );
    }

    // Hash new password
    const passwordHashValue = await hashPassword(password);

    // Update user password and mark token as used
    await db. transaction(async (tx) => {
      await tx
        .update(users)
        .set({ 
          passwordHash: passwordHashValue,
          updatedAt: new Date(),
        })
        .where(eq(users.id, resetToken.userId));

      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetToken.id));
    });

    return NextResponse.json({
      message: 'Password reset successful.  You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}