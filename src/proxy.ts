import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const isAuthPage = req.nextUrl.pathname.startsWith("/dashboard") || 
                         req.nextUrl.pathname.startsWith("/admin") ||
                         req.nextUrl.pathname.startsWith("/checkout");
      
      if (isAuthPage) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/checkout/:path*",
  ],
};
