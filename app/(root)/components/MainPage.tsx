import { FC } from "react";
import Sidebar from "./Sidebar";

interface MainPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

const MainPage: FC<MainPageProps> = ({ session }) => {
  return (
    <>
      <main className="flex gap-x-5 py-5 px-5 sm:px-10 md:px-16 lg:px-24 h-screen bg-gray-100">
        <Sidebar className="sticky top-[4.25rem] hidden h-fit flex-none space-y-3 rounded-md border bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-60" />
        <div className="flex-1 bg-white border shadow-sm rounded-lg p-4">
          <h1 className="text-xl sm:text-2xl">
            Hello {session?.user?.name}, Here you can add your today Tasks.
          </h1>
        </div>
      </main>
      <Sidebar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
    </>
  );
};

export default MainPage;
