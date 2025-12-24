import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      email?: null | string;
      id: string;
      image?: null | string;
      name?: null | string;
    };
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
