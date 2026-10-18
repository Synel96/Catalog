import { API_MOCKS } from "@/components/site";
import { Card, CardContent } from "@/components/ui/card";

type Mews = {
  date: string;
  title: string;
  lede: string;
  body: string[];
  quote: { text: string; by: string };
};

// The mock-test announcement is only true of mock builds (see
// src/mocks), so a build against the real backend leaves it out.
const MEWS: Mews[] = API_MOCKS
  ? [
      {
        date: "2026-10-18",
        title: "Breaking Mews: Catalog testing has begun! 🐾",
        lede: "In what experts are calling the biggest event since the invention of the cardboard box, Catalog has officially entered testing.",
        body: [
          "This is a mock-up version. Every slave, overlord, post and Purrfect you see here is made up: there is no real server behind it, just a very convincing impression of one running inside your browser.",
          "Nothing you do here is saved on a server or sent anywhere. Your posts, reactions and whiskers never leave your browser. They're kept only in this tab and forgotten the moment you close it, faster than a cat forgets it was ever told “no”.",
          "So go ahead: post, hisss, whisker the neighbour's overlord. There are no consequences. Which, as every cat knows, is how things should always be.",
          "Found a bug? Knock it off the table and let us know.",
        ],
        quote: {
          text: "Finally, a social network that asks nothing of me. Purrfect.",
          by: "Mirci, Editor-in-Chief, from atop the fridge",
        },
      },
    ]
  : [];

const DATE_FORMAT = new Intl.DateTimeFormat("hu-HU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Mews</h1>
      <p className="text-muted-foreground mb-8">All the news that's fit to purr.</p>

      {MEWS.length === 0 ? (
        <p className="text-muted-foreground">No mews is good mews. Check back later. 😺</p>
      ) : (
        <div className="grid gap-6">
          {MEWS.map((mews) => (
            <Card key={mews.title} className="p-2 shadow-md">
              <CardContent>
                <article className="grid gap-4">
                  <header className="grid gap-2">
                    <time dateTime={mews.date} className="text-muted-foreground text-sm">
                      {DATE_FORMAT.format(new Date(mews.date))}
                    </time>
                    <h2 className="text-2xl leading-tight font-bold">{mews.title}</h2>
                    <p className="text-lg font-medium">{mews.lede}</p>
                  </header>
                  {mews.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <blockquote className="border-primary border-l-4 pl-4 italic">
                    <p>“{mews.quote.text}”</p>
                    <footer className="text-muted-foreground mt-1 text-sm not-italic">
                      — {mews.quote.by}
                    </footer>
                  </blockquote>
                </article>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
