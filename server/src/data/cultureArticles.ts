export interface CultureArticle {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  related_words: string[]; // Strong's ids
  body_md: string;
}

export const CULTURE_ARTICLES: CultureArticle[] = [
  {
    slug: 'feasts-of-israel',
    title: 'The Feasts of Israel',
    summary: 'Seven appointed times structured Israel\'s year around remembered rescue and anticipated redemption.',
    tags: ['worship', 'calendar', 'temple'],
    related_words: ['H7965', 'H8451'],
    body_md: `Leviticus 23 lays out Israel's sacred calendar — seven "appointed times" (*mo'adim*) that turned the agricultural year into a rehearsal of salvation history.

**Spring: the Passover cluster.** *Passover* (Pesach) remembered the night death passed over the blood-marked doors of Egypt (Exodus 12). It flowed straight into the week of *Unleavened Bread* — bread made in haste, with no time to rise — and *Firstfruits*, when the first barley sheaf was waved before the LORD. The New Testament writers saw the crucifixion and resurrection through exactly this lens: "Christ, our Passover lamb, has been sacrificed" (1 Corinthians 5:7), raised as "the firstfruits of those who have fallen asleep" (1 Corinthians 15:20).

**Fifty days on: Weeks.** *Shavuot* (Pentecost, "fiftieth") celebrated the wheat harvest, and by the first century was also associated with the giving of the Law at Sinai. Acts 2 is deliberate: on the feast of covenant-giving, the Spirit is given, and the harvest begins — three thousand in a day.

**Autumn: the seventh-month cluster.** *Trumpets* (later Rosh Hashanah) summoned the nation to attention. Ten days later came *the Day of Atonement* (Yom Kippur) — the one day a year the high priest entered the Most Holy Place, and the scapegoat carried the nation's sins into the wilderness (Leviticus 16; the argument of Hebrews 9–10). Five days after that, *Booths* (Sukkot) had all Israel camping in leafy shelters for a week, remembering the wilderness years — the feast during which Jesus stood up and cried, "If anyone thirsts, let him come to me and drink" (John 7:37), just as the priests were pouring out water drawn from Siloam.

The feasts were pilgrim festivals: three times a year every male was to "appear before the LORD" in Jerusalem (Deuteronomy 16:16). That pilgrim rhythm explains the crowds of the Gospels and Acts — and the Psalms of Ascent (120–134), the songbook of the road up to Zion.`,
  },
  {
    slug: 'covenant-customs',
    title: 'Cutting a Covenant',
    summary: 'Ancient covenants were enacted oaths — walked between halved animals, sealed with meals, marked in flesh.',
    tags: ['covenant', 'law', 'patriarchs'],
    related_words: ['H1285', 'H2617', 'H571'],
    body_md: `Hebrew does not "make" a covenant; it **cuts** one (*kārat berît*). The idiom preserves a ceremony: animals were halved and the parties passed between the pieces, enacting a self-curse — *may this be done to me if I break this bond*.

Genesis 15 is the most dramatic example, with a shocking twist. Abraham halves the animals and waits — but only God, appearing as a smoking firepot and blazing torch, passes between the pieces. God swears the self-curse **alone**. Abraham is a witness, not a co-signer. Jeremiah 34:18 shows the ordinary form: covenant-breakers are threatened with the fate of the calf they cut in two.

Ancient Near Eastern treaties between a great king and a lesser one (suzerain–vassal treaties) followed a recognizable pattern: the great king's titles, a history of his kindnesses, stipulations, blessings for loyalty, curses for betrayal, witnesses, and provisions for the document's safekeeping and public reading. **Deuteronomy is built on exactly this skeleton** — Israel's covenant charter, with the LORD as great king.

Covenants were sealed and remembered with:

- **A shared meal** — eating together bound the parties (Exodus 24:11: the elders "beheld God, and ate and drank"; echoed every time the church takes the cup of "the new covenant in my blood").
- **A sign** — the rainbow for Noah, circumcision for Abraham, Sabbath for Sinai.
- **A memorial object or name** — stone pillars, altars, a heap called "Witness" (Genesis 31:48).

Two covenant words repay study: *ḥesed* (H2617), the loyal love owed inside a covenant, and *emet* (H571), the reliability that keeps it. When Exodus 34:6 says the LORD abounds in *ḥesed we-emet*, it is covenant language — and John 1:14 translates it: the Word dwelt among us "full of **grace and truth**."`,
  },
  {
    slug: 'honor-and-shame',
    title: 'Honor & Shame in the Biblical World',
    summary: 'The Mediterranean world ran on public honor. Reading with honor/shame eyes unlocks challenge scenes, genealogies, and the scandal of the cross.',
    tags: ['society', 'gospels', 'social world'],
    related_words: ['H3519', 'G3107'],
    body_md: `Modern Western culture is oriented to guilt (an inner verdict on my actions). The biblical world was oriented to **honor and shame** — a public verdict on my worth, held in the eyes of the community. Honor was the real currency: more precious than money, defended more fiercely than property.

**Honor was either ascribed or achieved.** Ascribed honor came by birth — family, tribe, city. This is why genealogies open books (Matthew 1) and why "can anything good come out of Nazareth?" (John 1:46) is a real argument. Achieved honor was won in public contest — and could be lost the same way.

**The challenge–riposte game.** Public questions in the Gospels are rarely requests for information; they are honor challenges. "By what authority do you do these things?" "Is it lawful to pay taxes to Caesar?" Each exchange is a duel before an audience, and the audience awards the honor. Notice how often a Gospel scene ends: "and no one dared ask him any more questions" (Mark 12:34) — challenge met, honor won.

**Patronage bound society together.** A patron gave benefactions (*charis*, G5485 — grace); clients returned loyalty, public praise, and gratitude. Paul deliberately paints God as the great Benefactor whose favor cannot be earned or repaid, only received with allegiance (*pistis*, G4102 — faith).

**The cross was calculated maximum shame** — naked, public, outside the city, reserved for slaves and rebels. That is the force of Hebrews 12:2: Jesus "endured the cross, **despising the shame**." The gospel's most subversive move is re-mapping honor itself: blessed (*makarios*) are the poor, the meek, the persecuted; the first shall be last; God chose what is shameful in the world to shame the strong (1 Corinthians 1:27–28). And the resurrection is God's public verdict — the ultimate riposte — vindicating his shamed Son.`,
  },
  {
    slug: 'temple-layout',
    title: 'The Temple: Layout and Meaning',
    summary: 'Court by court, the temple staged one lesson — graded access to a holy God — which makes the torn veil the gospel in architecture.',
    tags: ['temple', 'worship', 'jerusalem'],
    related_words: ['H3519', 'H7965'],
    body_md: `The temple was a map of the universe and a diagram of the problem between God and humanity: **holiness at the center, and graded access outward**.

By Jesus's day, Herod's temple complex occupied a platform of some thirty-five acres. Moving inward:

1. **Court of the Gentiles** — the vast outer plaza, open to anyone. This is where the money-changers set up, and why Jesus's protest quotes Isaiah: "my house shall be called a house of prayer **for all nations**" (Mark 11:17). A stone barrier (the *soreg*) warned Gentiles, on pain of death, to go no further — the "dividing wall of hostility" Paul says Christ demolished (Ephesians 2:14).
2. **Court of the Women** — as far as Israelite women could go; site of the temple treasury, where Jesus watched the widow give her two coins (Mark 12:41–44).
3. **Court of Israel** — for ritually clean Jewish men.
4. **Court of the Priests** — the great altar of burnt offering and the bronze laver; priests only.
5. **The Holy Place** — inside the sanctuary building: the lampstand (menorah), the table of the bread of the Presence, and the incense altar, where Zechariah drew the lot of a lifetime (Luke 1:8–11).
6. **The Most Holy Place** (Holy of Holies) — a perfect cube behind the great veil, empty in the second temple (the ark was lost with Babylon), entered by one man, one day a year, with blood (Leviticus 16).

Every court said the same thing: *this far, and no further*. Which is why the Gospels record, at the moment Jesus died, that "the veil of the temple was torn in two, **from top to bottom**" (Mark 15:38) — and why Hebrews dares to say we now "have confidence to enter the holy places by the blood of Jesus" (Hebrews 10:19).

The New Testament then relocates the temple entirely: Jesus's body is the true sanctuary (John 2:21), the church is "a dwelling place for God by the Spirit" (Ephesians 2:22), and the new Jerusalem needs no temple at all, "for its temple is the Lord God the Almighty and the Lamb" (Revelation 21:22).`,
  },
  {
    slug: 'sabbath-and-sacred-time',
    title: 'Sabbath and Sacred Time',
    summary: 'Israel\'s calendar built rest into creation\'s rhythm — a weekly declaration of trust, liberation, and things to come.',
    tags: ['calendar', 'law', 'worship'],
    related_words: ['H7965', 'H8085'],
    body_md: `The Bible's first holy thing is not a mountain, a shrine, or a person — it is a **day** (Genesis 2:3). Sabbath is sacred architecture built out of time.

The two givings of the command ground it differently, and both matter:

- **Exodus 20:11 — creation.** Rest because God rested: work is good, but it is not god. Ceasing one day in seven confesses that the world is upheld by its Maker, not by my labor.
- **Deuteronomy 5:15 — liberation.** Rest because you were slaves and were brought out. Slaves cannot take a day off; free people can. And the command extends the freedom down the whole social ladder — son, servant, foreigner, even the ox.

The principle radiated outward into whole years: every seventh year the land itself rested and debts were released (the sabbatical year), and after seven sevens came **Jubilee** (Leviticus 25) — liberty proclaimed, ancestral land returned, an economy periodically reset against permanent poverty. When Jesus opened his ministry at Nazareth reading Isaiah 61 — "to proclaim liberty to the captives... the year of the Lord's favor" (Luke 4:18–19) — he was announcing Jubilee.

By the first century, Sabbath-keeping had accumulated a fence of case law (thirty-nine categories of forbidden work in the later Mishnah). Jesus's Sabbath conflicts are never against the Sabbath itself but against the fence obscuring its gift: "The Sabbath was made for man, not man for the Sabbath" (Mark 2:27). Healing on the Sabbath was not a violation but its fulfillment — *shalom* restored on the day of shalom.

Hebrews 4 completes the arc: "there remains a Sabbath rest for the people of God." The weekly practice was always also a promise — a rehearsal, one day in seven, of creation healed.`,
  },
  {
    slug: 'betrothal-and-marriage',
    title: 'Betrothal & Marriage Customs',
    summary: 'Bride-price, binding betrothal, the bridegroom\'s night arrival, a week of feasting — the customs behind Mary\'s crisis and Christ\'s promises.',
    tags: ['family', 'society', 'gospels'],
    related_words: ['H2617', 'G26'],
    body_md: `Marriage in ancient Israel joined not just two people but two households, and it unfolded in two distinct stages.

**Stage one: betrothal (*kiddushin*).** Negotiated between families, sealed with a bride-price (*mohar*) paid to the bride's family and often a cup of wine accepted by the bride. Betrothal was **legally binding marriage** — breakable only by divorce, and infidelity during it counted as adultery — yet the couple did not live together, usually for about a year. This is Mary and Joseph's exact situation: "betrothed... before they came together" (Matthew 1:18). It is why Joseph, though only betrothed, must consider a formal divorce, and why the pregnancy was a mortal honor crisis — betrothed women who proved unfaithful faced the penalty of adulteresses (Deuteronomy 22:23–24).

**Stage two: the wedding (*nissuin*).** At a time set by the groom's father, the bridegroom came — traditionally at night, with torches and shouting — to carry the bride from her father's house to his own, often to rooms he had spent the betrothal year preparing. Then followed up to **seven days of feasting** (Judges 14:12), for which running out of wine was a family disgrace (John 2:1–10). Wedding guests fasting while the bridegroom was present was unthinkable (Mark 2:19).

Once the customs are in view, whole passages open up:

- "In my Father's house are many rooms... **I go to prepare a place for you**, and I will come again and take you to myself" (John 14:2–3) — the bridegroom's promise during betrothal.
- The ten virgins with lamps, waiting through the night for the delayed bridegroom's cry (Matthew 25:1–13).
- "Concerning that day and hour no one knows" (Matthew 24:36) — as the wedding day rested with the groom's father.
- The Bible's last scene: "the marriage supper of the Lamb," a bride prepared, and the Spirit and the bride saying "Come" (Revelation 19:7; 22:17).

Paul makes the theology explicit: "I betrothed you to one husband, to present you as a pure virgin to Christ" (2 Corinthians 11:2). The church lives, in effect, between kiddushin and nissuin.`,
  },
];

export const ARTICLES_BY_SLUG = new Map(CULTURE_ARTICLES.map((a) => [a.slug, a]));
