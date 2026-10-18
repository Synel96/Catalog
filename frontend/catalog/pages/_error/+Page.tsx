import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
  const { is404 } = usePageContext();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <img src="/whisker.png" alt="" className="size-16 object-contain" />
      <h1 className="text-3xl font-bold">{is404 ? "Page Not Found" : "Internal Error"}</h1>
      <p className="text-muted-foreground">
        {is404
          ? "This page could not be found. Maybe an overlord knocked it off the table."
          : "Something went wrong."}
      </p>
      <a href="/" className="font-medium underline-offset-4 hover:underline">
        Back to Catalog
      </a>
    </div>
  );
}
