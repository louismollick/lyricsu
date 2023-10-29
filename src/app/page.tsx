import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
// import { api } from "~/trpc/server";
import Player from "../components/player";
import { type Metadata } from "next";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Lyricsu",
  description:
    "Learn Japanese kanji while listening to your favorite Spotify songs!",
  icons: {
    icon: "/favicon.ico",
  },
};

const DEFAULT_TRACK = {
  id: 0,
  spotifyId: "6n9AvpTLSNunpIr2Gr2AXa",
  name: "potage",
  lyrics:
    '{"error":false,"syncType":"LINE_SYNCED","lines":[{"startTimeMs":"25250","words":"心の膜が剥がれ落ちてゆく","syllables":[],"endTimeMs":"0"},{"startTimeMs":"31680","words":"優しいポタージュ色の","syllables":[],"endTimeMs":"0"},{"startTimeMs":"36170","words":"キャラメルの味","syllables":[],"endTimeMs":"0"},{"startTimeMs":"39260","words":"アイルランドで","syllables":[],"endTimeMs":"0"},{"startTimeMs":"43770","words":"コーヒー飲もうよ","syllables":[],"endTimeMs":"0"},{"startTimeMs":"46760","words":"世界がどうなっているとか","syllables":[],"endTimeMs":"0"},{"startTimeMs":"51320","words":"誰が悪いとか","syllables":[],"endTimeMs":"0"},{"startTimeMs":"54110","words":"そんなことより","syllables":[],"endTimeMs":"0"},{"startTimeMs":"57250","words":"話したいことがあるわ","syllables":[],"endTimeMs":"0"},{"startTimeMs":"61240","words":"髪を切る時は","syllables":[],"endTimeMs":"0"},{"startTimeMs":"66880","words":"あたしの顔色を気にして欲しい","syllables":[],"endTimeMs":"0"},{"startTimeMs":"72350","words":"あたしだけのものになんて","syllables":[],"endTimeMs":"0"},{"startTimeMs":"78390","words":"いつまでもならないで","syllables":[],"endTimeMs":"0"},{"startTimeMs":"84420","words":"どんなに硬い契約にも","syllables":[],"endTimeMs":"0"},{"startTimeMs":"90980","words":"心は報われない","syllables":[],"endTimeMs":"0"},{"startTimeMs":"93530","words":"だって絶対なんて絶対にないから","syllables":[],"endTimeMs":"0"},{"startTimeMs":"97990","words":"♪","syllables":[],"endTimeMs":"0"},{"startTimeMs":"108880","words":"小さな約束守れないの知ってるし","syllables":[],"endTimeMs":"0"},{"startTimeMs":"116050","words":"最初から一生許してあげる","syllables":[],"endTimeMs":"0"},{"startTimeMs":"123330","words":"つまりはあたしの","syllables":[],"endTimeMs":"0"},{"startTimeMs":"129370","words":"一生をあげる","syllables":[],"endTimeMs":"0"},{"startTimeMs":"135280","words":"たまには弱いところも見てみたい","syllables":[],"endTimeMs":"0"},{"startTimeMs":"139650","words":"笑っちゃうかもしれないね","syllables":[],"endTimeMs":"0"},{"startTimeMs":"142710","words":"♪","syllables":[],"endTimeMs":"0"},{"startTimeMs":"162660","words":"不安ははたまた","syllables":[],"endTimeMs":"0"},{"startTimeMs":"168060","words":"無邪気な夜に","syllables":[],"endTimeMs":"0"},{"startTimeMs":"172850","words":"簡単に","syllables":[],"endTimeMs":"0"},{"startTimeMs":"177660","words":"消されるのだ","syllables":[],"endTimeMs":"0"},{"startTimeMs":"182620","words":"本当はたまには少し","syllables":[],"endTimeMs":"0"},{"startTimeMs":"188290","words":"強がってみたりしてみたい","syllables":[],"endTimeMs":"0"},{"startTimeMs":"193730","words":"どうせ失敗するのは目に見えている","syllables":[],"endTimeMs":"0"},{"startTimeMs":"199650","words":"優しさだけがあたしの取り柄だから でも","syllables":[],"endTimeMs":"0"},{"startTimeMs":"204740","words":"あなただけのものになんて","syllables":[],"endTimeMs":"0"},{"startTimeMs":"210580","words":"いつまでもなりやしないわ","syllables":[],"endTimeMs":"0"},{"startTimeMs":"215930","words":"どんなに硬い契約にも","syllables":[],"endTimeMs":"0"},{"startTimeMs":"222020","words":"心は縛れない","syllables":[],"endTimeMs":"0"},{"startTimeMs":"224340","words":"だって絶対なんて絶対にないけど","syllables":[],"endTimeMs":"0"},{"startTimeMs":"230300","words":"あたしの一生をあげる","syllables":[],"endTimeMs":"0"},{"startTimeMs":"236080","words":"","syllables":[],"endTimeMs":"0"}]}',
};

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    return (
      <Button asChild>
        <Link href="/api/auth/signout">Sign out</Link>
      </Button>
    );
  }

  return (
    <>
      <div className="container min-h-0 py-12 text-6xl">
        <ScrollArea className="h-full rounded-md border p-4">
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            JSON.parse(DEFAULT_TRACK.lyrics).lines.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (l: any, index: number) => (
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                <div key={index}>{l.words}</div>
              ),
            )
          }
        </ScrollArea>
      </div>
      <Player
        trackUri={`spotify:track:${DEFAULT_TRACK.spotifyId}`} //${currentTrack.spotifyId}
      />
    </>
  );
}
