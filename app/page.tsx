import MainPage from "@/src/views/MainPage";

export const metadata = {
  title: "MyPrice BD - Best Price Comparison in Bangladesh",
  description:
    "Compare electronics prices from Daraz, StarTech, Pickaboo, BDStall and more.",
};

export default function Home() {
  return <MainPage />;
}

/// ENV VARS (for reference, not part of the code)
/*NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL_1=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL_2=http://localhost:4000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
*/
