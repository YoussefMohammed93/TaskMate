import Sidebar from "../components/Sidebar";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="mx-auto flex gap-x-5 w-full grow py-5 px-5 sm:px-10 md:px-16 lg:px-24">
          <Sidebar className="sticky top-[4.25rem] hidden h-fit flex-none space-y-3 rounded-md border bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-60" />
          {children}
        </div>
        <Sidebar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </>
  );
}
