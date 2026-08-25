import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protege todo excepto /login, assets estáticos y las rutas de auth.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
