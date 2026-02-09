import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Resend from "next-auth/providers/resend";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Resend({ from: process.env.RESEND_FROM })],
  secret: process.env.AUTH_SECRET,
  events: {
    async signIn({ user }) {
      if (!user?.email) return;

      await prisma.clinicMember.updateMany({
        where: {
          email: user.email,
          userId: null,
        },
        data: { userId: user.id },
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { activeClinicId: true },
      });

      if (updatedUser?.activeClinicId) return;

      const membership = await prisma.clinicMember.findFirst({
        where: { userId: user.id },
        select: { clinicId: true },
      });

      if (membership) {
        await prisma.user.update({
          where: { id: user.id },
          data: { activeClinicId: membership.clinicId },
        });
      }
    },
  },
});
