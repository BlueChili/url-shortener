import { PropsWithChildren } from "@elysiajs/html";

const Layout = (props: PropsWithChildren) => {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div className="flex flex-col justify-center items-center min-h-screen container px-3 mx-auto">
          <h1 className="pb-8 text-cyan-950 text-center font-bold text-2xl md:text-3xl">
            Boston firearms url shortener
          </h1>
          {props.children}
          <a href="/archive" className="font-bold pt-8 underline">
            Archive
          </a>
        </div>
      </body>
    </html>
  );
};

export default Layout;
