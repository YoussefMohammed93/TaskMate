import { signIn } from "next-auth/react";
import { Github, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import TypingText from "@/components/animata/text/typing-text";

const MarktingPage = () => {
  const handleSignIn = async () => {
    await signIn("github");
  };

  return (
    <main className="flex flex-col items-center justify-center h-[calc(100vh-60px)] bg-gray-100">
      <div className="flex flex-col items-center justify-center p-2">
        <div className="flex items-center border shadow-sm rounded-full uppercase p-3 md:p-4 mb-4 text-amber-600 bg-amber-100">
          <Medal className="size-6 mr-2" />
          <p className="text-sm">No 1 task management</p>
        </div>
        <h1 className="text-center text-3xl md:text-6xl font-semibold text-neutral-800 mb-6">
          Taskmate helps team move
        </h1>
        <h2 className="w-full md:w-3/4 text-center text-3xl md:text-6xl font-semibold p-4 rounded-md text-white bg-gradient-to-r from-fuchsia-500 to-orange-500">
          <TypingText text="Work forward." />
        </h2>
      </div>
      <div className="text-center max-w-xs md:max-w-2xl mx-auto mt-6">
        <p className="md:text-lg text-neutral-500">
          Collaborate, manage projects, and reach new productivity peaks. From
          high rises to home office, accomplish it all with Taskmate
        </p>
      </div>
      <div className="mt-6">
        <Button
          onClick={handleSignIn}
          variant="default"
          size="lg"
          className="text-lg"
        >
          <span>Login with github</span>
          <Github className="size-5" />
        </Button>
      </div>
    </main>
  );
};

export default MarktingPage;
