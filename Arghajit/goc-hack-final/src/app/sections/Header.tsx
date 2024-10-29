import MenuIcon from "@/assets/icon-menu.svg"
import { Button } from "@/components/button"
import { GlazeButton } from "@/components/glaze-button"
import Logo from "@/assets/logo-w.png"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"

export const Header = async () => {
  const { userId, redirectToSignIn } = await auth()
  return (
    <header className="py-4 border-b border-white/15 md:border-none sticky top-0 z-10 ">
      <div className="absolute inset-0 backdrop-blur -z-10 md:hidden"></div>
      <div className="container">
        <div className="flex justify-between items-center md:border rounded-lg border-white/15  md:py-2.5 md:px-5 max-w-2xl mx-auto relative ">
          <div className="hidden md:block absolute inset-0 backdrop-blur -z-10 "></div>
          <div>
            {/* To make the border of the Logo inline-flex to make it in center aligfned with Logo */}
            <div className="border h-10 w-28 rounded-xl border-white/15 inline-flex justify-center items-center mr-10">
              <img src={Logo.src} />
            </div>
          </div>
          <div className="gap-4 items-center hidden md:block">
            <Link href="/">Home </Link>
          </div>

          <div className=" items-center">
            <Link href="/attempt-test/testcode">
              <Button text="Attend Test" />
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/upload-handler-3">
              <Button text="Create Test" />
            </Link>
            {/* <Link href="/admin">
              <Button text="Create Test" />
            </Link> */}
          </div>
          <div>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}
