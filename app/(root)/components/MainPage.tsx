import { FC } from "react";

interface MainPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
}

const MainPage: FC<MainPageProps> = ({ session }) => {
  return (
    <main className="p-5">
      <div>Hello, {session?.user?.name}</div>
    </main>
  );
};

export default MainPage;
