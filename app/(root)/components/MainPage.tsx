import { FC } from "react";

interface MainPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

const MainPage: FC<MainPageProps> = ({ session }) => {
  return (
    <main className="py-5 px-5 sm:px-10 md:px-16 lg:px-24">
      <div>
        Hello, {session?.user?.name}
        <p>Now you are logged in</p>
      </div>
    </main>
  );
};

export default MainPage;
