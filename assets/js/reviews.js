// Made-up customer reviews and questions for every Redbird product. All people and text are invented.
//
// Shape per product id:
//   summary    the "Customers say" box: what most buyers like, what some complain about
//   fit        clothing only: how the sizes fit, from what the reviews say
//   aspects    things buyers mention, with counts of positive (good) and negative (bad) mentions
//   reviews    5 to 8 reviews, oldest products back to 2024. variant only on products with swatches or sizes.
//              verified: false means it is not marked "Verified Purchase".
//              photo (0 or 1) means the review shows customer photo #0 or #1.
//   questions  1 to 4 shopper questions with answers
window.RB_REVIEWS = {
  // ── Chargers ─────────────────────────────────────────────────────────────
  'rb-20w-usbc-charger': {
    summary: "Buyers like how small this charger is, how fast it charges a phone, and the folding plug that lets it ride in a pocket or bag. Lots of people keep a spare by the bed or in a travel bag. It can get warm while charging, and a few stopped working after a few months.",
    aspects: [
      { name: "Charging speed", good: 2140, bad: 176 },
      { name: "Size", good: 1630, bad: 42 },
      { name: "Folding plug", good: 905, bad: 31 },
      { name: "Durability", good: 610, bad: 233 },
      { name: "Heat", good: 120, bad: 298 },
    ],
    reviews: [
      { name: "Denise W.", date: "2026-05-08", stars: 5, title: "Finally a charger that stays in hotel outlets", text: "I travel for work almost every week and I'm so tired of big chargers that fall out of hotel outlets. This one is about the size of a big ice cube and it stays put even in those loose outlets behind the nightstand. Charged my Pixel 8 and my iPad mini fine, iPad is slower obviously but it gets there. Love that the prongs fold, nothing poking holes in my bag lining anymore. About 5 months now and no issues. The little light on it is kind of bright next to the bed so I put a piece of tape over it", verified: true, helpful: 287 },
      { name: "Priya K.", date: "2025-10-14", stars: 5, title: "Small and actually fast", text: "Charges my iPhone 15 from about 10% to a little over half in the time it takes me to shower and get dressed. Plug folds in so I just toss it in my work bag.", verified: true, helpful: 23, photo: 0 },
      { name: "mike_in_oakland", date: "2026-07-02", stars: 5, title: "bought 3", text: "bought one, liked it, went back and got two more. one for the car bag one for my desk one for the kitchen. no complaints", verified: true, helpful: 11 },
      { name: "Tomás R.", date: "2025-03-19", stars: 4, title: "Works, gets a little warm", text: "Does what it says. Gets warm charging my Galaxy S23 but never hot enough that I worried about it. Standard shipping took 7 days though, I was expecting it way sooner.", verified: true, helpful: 14 },
      { name: "Bill Grapes", date: "2025-09-27", stars: 5, title: "Enough power", text: "20W should be enough for anybody.", verified: true, helpful: 4 },
      { name: "Jamal Pierce", date: "2025-05-11", stars: 4, title: "Not quite 50% in 30 min for me", text: "With my iPhone 13 it was more like 40-45% in half an hour. still way faster than the old tiny cube I had before. nice and small", verified: true, helpful: 9 },
      { name: "Curtis L.", date: "2024-08-30", stars: 2, title: "Died after 3 months", text: "Worked great until it didn't. Around 3 months in it started cutting in and out and now it doesnt charge at all. Tried different cables and outlets, it's the charger. Support is sending a replacement so we'll see.", verified: true, helpful: 38 },
      { name: "K. Tran", date: "2024-06-22", stars: 1, title: "Five business days?", text: "Ordered Monday, got it the next Monday. In this day and age. One star.", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Does this work with a Pixel 9?", a: "yes, mine charges fine. it shows fast charging on the lock screen too", by: "Aaron", date: "2026-07-19", votes: 14 },
      { q: "Does it come with a cable?", a: "No, the box includes the charger only. You will need a USB-C cable, which is sold separately.", by: "Seller", date: "2025-05-02", votes: 22 },
      { q: "Can I use it in Europe?", a: "yeah its 100-240V so the charger is fine, you just need a plug adapter bc the prongs are US style", by: "Redbird Customer", date: "2025-04-11", votes: 8 },
    ],
  },

  'voltedge-20w-usbc': {
    summary: "The charger itself works fine and charges phones at a normal fast speed. Shipping is the big problem. It comes from overseas and often takes two to four weeks to arrive. Reviewers also say the glossy black finish scratches easily and shows fingerprints.",
    aspects: [
      { name: "Shipping time", good: 41, bad: 312 },
      { name: "Charging speed", good: 288, bad: 36 },
      { name: "Finish", good: 52, bad: 97 },
      { name: "Value", good: 140, bad: 88 },
    ],
    reviews: [
      { name: "Brandon S.", date: "2026-06-03", stars: 1, title: "Took 23 days to arrive", text: "Ordered this when my old charger broke thinking it'd be here in a few days. It said ships from overseas but I didn't notice that part. 23 days later it showed up. I had already bought another one at the drugstore by then. Charger works I guess but I would not order it again.", verified: true, helpful: 41 },
      { name: "Lucia M.", date: "2026-04-28", stars: 4, title: "Fine charger, slow shipping", text: "Works fine with my iPhone 16. Took almost 3 weeks to get here so plan ahead", verified: true, helpful: 17 },
      { name: "sandy_b", date: "2026-07-21", stars: 2, title: "scratches easy", text: "the glossy finish got scratched up in my purse within a week and it's a fingerprint magnet. charges ok. also took 18 days", verified: true, helpful: 9 },
      { name: "Owen Gallagher", date: "2026-03-09", stars: 5, title: "Fast charges my Galaxy", text: "My Galaxy A54 says Fast charging on the lock screen with this. Long wait for shipping but I wanted a black one and this was the only black one I liked.", verified: true, helpful: 3 },
      { name: "Redbird Customer", date: "2026-05-17", stars: 4, title: "Does the job", text: "Charges my phone and my kid's tablet. Shipping was slow, about 2 and a half weeks.", verified: true, helpful: 0 },
      { name: "Ade O.", date: "2025-11-04", stars: 5, title: "no complaints", text: "Good charger. I knew it was coming from overseas going in so the wait didn't bother me", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "How long does shipping actually take?", a: "Mine took 16 days to California.", by: "Lucia", date: "2026-05-01", votes: 31 },
      { q: "Is this as fast as other 20W chargers?", a: "Yes. It supports PD fast charging at up to 20 W, the same as other 20 W USB-C chargers.", by: "Seller", date: "2026-03-22", votes: 7 },
      { q: "Do the prongs fold?", a: "no they're fixed, they don't fold", by: "Redbird Customer", date: "2026-08-09", votes: 5 },
    ],
  },

  'chargemate-20w-lightning': {
    summary: "The 6-foot cable built into the charger gets the most praise, since it reaches from the wall to a bed or couch, and older iPhones charge quickly with it. The catch for several buyers is that the cable ends in a Lightning plug, so it won't fit newer USB-C iPhones or Android phones.",
    aspects: [
      { name: "Cable length", good: 1180, bad: 64 },
      { name: "Charging speed", good: 870, bad: 92 },
      { name: "Connector type", good: 210, bad: 640 },
      { name: "Build quality", good: 430, bad: 150 },
    ],
    reviews: [
      { name: "Carla J.", date: "2026-03-27", stars: 1, title: "It's LIGHTNING not USB-C", text: "The title says USB C right there and I bought it for my iPhone 16. It's a Lightning cable. It does not fit. Apparently the USB C part is inside the block?? Which you can't even use because the cable is built in. Returned.", verified: true, helpful: 156 },
      { name: "Walt H.", date: "2025-07-19", stars: 5, title: "Long cord is great", text: "I'm 74 and have an iPhone 12 that I'm not replacing anytime soon. The 6 foot cord reaches from the outlet behind the nightstand all the way to my recliner. Charges fast.", verified: true, helpful: 33 },
      { name: "Nicole A.", date: "2026-08-04", stars: 5, title: "Perfect for my son's old iPad", text: "Bought for my son's older iPad that still uses Lightning. Love that the cable is attached so he can't lose it.", verified: true, helpful: 8 },
      { name: "dev.r", date: "2025-06-12", stars: 4, title: "good but cable is stiff", text: "cable is long and seems tough but it's kind of stiff and keeps the coils from the packaging. charges my iphone 11 fast", verified: true, helpful: 4 },
      { name: "Ben Okafor", date: "2026-09-08", stars: 4, title: "Read the listing carefully", text: "Works great for my iPhone 14 but heads up to anyone with a 15 or 16, this will not fit your phone. I almost bought one for my wife too before I realized her phone is USB-C.", verified: true, helpful: 64 },
      { name: "Bonnie G.", date: "2025-07-30", stars: 2, title: "Cable frayed at the plug", text: "Cable started splitting right where it goes into the Lightning end after about 4 months. You can't replace just the cable since it's built in, so the whole thing is trash now.", verified: true, helpful: 27 },
      { name: "Marisol V.", date: "2026-02-16", stars: 5, title: "Exactly what I needed", text: "Needed a 20W Lightning one with the cable built in and this is exactly that. My iPhone 13 goes from almost dead to about half in half an hour. Came in 2 days", verified: true, helpful: 2 },
      { name: "Tim Cookie", date: "2026-10-01", stars: 3, title: "Time to switch", text: "Lightning was great for its time. If your phone is new you want USB-C now.", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Will this work with iPhone 15?", a: "No. iPhone 15 and newer use USB-C. This charger has a Lightning plug, which fits iPhone 14 and older.", by: "Seller", date: "2025-04-03", votes: 89 },
      { q: "Can you unplug the cable from the block?", a: "no it's attached for good", by: "Jordan", date: "2025-06-25", votes: 20 },
    ],
  },

  'kestrel-65w-gan': {
    summary: "Customers say it's strong enough to charge a laptop and a phone at the same time, and many travel with it instead of several chargers. It's also much smaller than a typical laptop charger. With all three ports busy it gets warm, and it's wide enough to block the other outlet.",
    aspects: [
      { name: "Laptop charging", good: 1560, bad: 48 },
      { name: "Multiple ports", good: 1220, bad: 37 },
      { name: "Size", good: 980, bad: 155 },
      { name: "Heat", good: 90, bad: 140 },
    ],
    reviews: [
      { name: "Eli Brennan", date: "2025-06-14", stars: 5, title: "Replaced 3 chargers in my backpack", text: "I used to carry my laptop brick plus a phone charger plus another one for my earbuds, now I just carry this. It charges my MacBook Air at full speed and my phone off the second USB-C port at the same time, and I plug the earbuds into the USB-A one with an old cable. Took it on a 10 day trip to Chicago and Denver and didn't bring any other charger. Its a bit heavier than a phone charger, still way smaller than the laptop brick.", verified: true, helpful: 121, photo: 0 },
      { name: "Fatima Z.", date: "2025-05-30", stars: 5, title: "Charges my work laptop", text: "Works with my Dell work laptop over USB-C. IT said it needs 65W and it charges fine.", verified: true, helpful: 21 },
      { name: "Greg T.", date: "2026-08-22", stars: 3, title: "Blocks the other outlet", text: "No problems with the charging part. Problem is it's so wide it covers the other outlet on my wall plate, so now I have to use a little extension cord. wish it was thinner", verified: true, helpful: 18 },
      { name: "Sophie N.", date: "2026-03-05", stars: 5, title: "small for 65W", text: "smaller than I expected for a laptop charger. fits in the zipper pocket of my laptop sleeve", verified: true, helpful: 5 },
      { name: "Kwame A.", date: "2026-07-16", stars: 4, title: "Gets warm with everything plugged in", text: "With the laptop, phone and watch all going it gets pretty warm. Not too hot to touch but warm. With just the laptop it's fine.", verified: true, helpful: 12 },
      { name: "Marcus D.", date: "2026-09-21", stars: 5, title: "Note about the power split", text: "Just so people know, when you plug in more than one thing the 65W gets split up, so the laptop charges a bit slower if your phone is plugged in too. I expected that, still fast enough for me", verified: true, helpful: 46 },
      { name: "Lena Fischer", date: "2025-07-27", stars: 5, title: "Good for a shared desk", text: "My husband and I share a desk and this charges both our phones and my laptop off one outlet. Going on 6 months with no problems", verified: true, helpful: 7 },
    ],
    questions: [
      { q: "Will this charge a 16 inch MacBook Pro?", a: "it does but slower than the one that came with it. if I'm doing something heavy it actually loses battery. fine overnight tho", by: "Eli", date: "2025-07-10", votes: 37 },
      { q: "Does the plug fold?", a: "Yes. The prongs fold flat into the charger.", by: "Seller", date: "2026-03-18", votes: 19 },
      { q: "Can I charge two laptops at once?", a: "you can plug in two but the power gets split so both charge pretty slow. one laptop plus a phone is the sweet spot", by: "Redbird Customer", date: "2025-08-01", votes: 11 },
    ],
  },

  'kestrel-30w-dual': {
    summary: "People mostly bring up the slim, flat shape, which fits behind furniture and in tight spots where bulky chargers don't. The two ports let a phone and earbuds or a watch charge together. Charging slows down with both ports in use, and a few say it slips out of older, looser outlets.",
    aspects: [
      { name: "Slim design", good: 620, bad: 18 },
      { name: "Two ports", good: 540, bad: 35 },
      { name: "Charging speed", good: 410, bad: 96 },
      { name: "Fit in outlet", good: 150, bad: 72 },
    ],
    reviews: [
      { name: "Hector Ruiz", date: "2026-05-04", stars: 5, title: "Fits behind my bed", text: "My bed is pushed right up against the outlet and nothing else fit back there. This one is flat enough that the headboard doesn't push it out. Charges my phone and earbuds overnight.", verified: true, helpful: 52 },
      { name: "Ravi Iyer", date: "2026-07-07", stars: 3, title: "Slower when both are plugged in", text: "Fast charges my Pixel when its the only thing plugged in. Plug in a second thing and it slows way down, 30W split two ways isn't much. fine overnight but no good for a quick top up", verified: true, helpful: 29 },
      { name: "Jenna M.", date: "2026-03-29", stars: 5, title: "Phone + watch", text: "I do phone on one port and watch on the other and both are full by morning. Like the matte finish too, it doesnt slide around", verified: true, helpful: 6 },
      { name: "Amy C.", date: "2026-08-20", stars: 5, title: "Good travel charger", text: "Slim enough for the front pocket of my passport wallet. Took it to Mexico, same plugs as here, and charged my phone and Kindle every night.", verified: true, helpful: 3 },
      { name: "Greg Rockman", date: "2026-04-25", stars: 5, title: "Kept me going", text: "Charged my laptop and my phone through a 3am coding session. Then the next one.", verified: true, helpful: 1 },
      { name: "Patricia O.", date: "2025-11-12", stars: 5, title: "Works with both our phones", text: "Works well with my Galaxy and my husband's iPhone. We charge both off one outlet in the guest room.", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Can it fast charge two phones at the same time?", a: "Not both at full speed. With two devices connected, the 30 W is shared between the two ports.", by: "Seller", date: "2026-04-08", votes: 24 },
      { q: "How thick is it?", a: "about as thick as two phones stacked, maybe a little less", by: "Hector", date: "2026-05-20", votes: 9 },
      { q: "Does it work with Pixel 8?", a: "yes", by: "Redbird Customer", date: "2026-07-28", votes: 3 },
    ],
  },

  'pebble-20w-2pack': {
    summary: "Two chargers for this price is the main draw, and buyers often keep one at home and one at work. They like the small, rounded shape too. The most common complaint is that the pack sells out a lot, sometimes in the middle of checkout. A few had one of the two stop working early.",
    aspects: [
      { name: "Value", good: 1290, bad: 88 },
      { name: "Size and shape", good: 760, bad: 40 },
      { name: "Availability", good: 35, bad: 410 },
      { name: "Durability", good: 380, bad: 190 },
    ],
    reviews: [
      { name: "Stephanie L.", date: "2025-10-06", stars: 3, title: "Good chargers, impossible to buy", text: "This is the third time I've tried to get this. Twice it went out of stock while it was in my cart. Third time it finally went through. The chargers themselves are fine, nothing special. Just annoying.", verified: false, helpful: 77 },
      { name: "Chris Ng", date: "2026-05-15", stars: 5, title: "One for home one for the office", text: "Exactly what the listing says. One lives in my desk drawer at work now and the other ones at home. I like that theyre round, nothing sharp poking around in my bag", verified: false, helpful: 12, photo: 0 },
      { name: "Abby R.", date: "2025-07-12", stars: 5, title: "great deal when it's in stock", text: "grabbed it during the deal. if it says out of stock keep checking back, it comes back every few days", verified: true, helpful: 21 },
      { name: "Redbird Customer", date: "2026-09-19", stars: 1, title: "One of the two died in a month", text: "First one still works. The second one stopped after about 5 weeks, no light, nothing. So I basically paid 20 bucks for one charger", verified: true, helpful: 34 },
      { name: "Luis F.", date: "2025-04-13", stars: 4, title: "Fine", text: "They charge my phone fast. A little bigger than I pictured for something called pebble but still small.", verified: true, helpful: 3 },
      { name: "Mei Chen", date: "2026-06-08", stars: 5, title: "Split it with my mom", text: "Gave one to my mom and kept one. She likes that it's round and easy to hold onto when pulling it out of the wall.", verified: true, helpful: 9 },
      { name: "J. Alvarez", date: "2025-12-03", stars: 4, title: "Finally restocked", text: "Was out of stock for like two weeks. When it came back I bought two packs just in case. Charges my Galaxy fine.", verified: false, helpful: 6 },
    ],
    questions: [
      { q: "Do they come with cables?", a: "no, just the 2 chargers", by: "Chris", date: "2026-05-22", votes: 18 },
      { q: "Will it charge a Kindle?", a: "yes mine charges a Kindle fine with a usb c cable", by: "Redbird Customer", date: "2025-08-29", votes: 5 },
    ],
  },

  // ── More electronics ─────────────────────────────────────────────────────
  'rb-usbc-cable-6ft': {
    summary: "Reviewers like that this cable reaches a bed or couch, stays untangled and holds up to everyday use. People often buy a few for different rooms. A few had the plug get loose over time, and some find 6 feet too long for a car.",
    aspects: [
      { name: "Length", good: 3820, bad: 210 },
      { name: "Durability", good: 2950, bad: 310 },
      { name: "Tangling", good: 1240, bad: 22 },
      { name: "Charging speed", good: 1610, bad: 95 },
      { name: "Value", good: 2100, bad: 40 },
    ],
    reviews: [
      { name: "Olivia P.", date: "2026-04-02", stars: 5, title: "6 ft is the right length", text: "Long enough to use my phone in bed while it charges. The braid doesn't get all twisted like my old cables.", verified: true, helpful: 18 },
      { name: "Andre M.", date: "2025-06-25", stars: 5, title: "Holding up great", text: "I've bought about 5 of these over time. The oldest one is 8 months old and gets yanked out of the wall by my dog regularly, still works.", verified: true, helpful: 31 },
      { name: "Sam Whitfield", date: "2026-05-30", stars: 5, title: "Charges my laptop too", text: "Using it with the Hanker 65W and it charges my MacBook Air no problem. 60W max is plenty for that.", verified: true, helpful: 22 },
      { name: "Xavier N.", date: "2025-10-13", stars: 2, title: "Loose at the phone end", text: "After a couple months the plug end got loose and my phone stops charging if I move it. The second one I bought is fine so far.", verified: true, helpful: 14 },
      { name: "Wendy Park", date: "2025-07-21", stars: 5, title: "Bought for my dad", text: "My dad kept breaking the cord that came with his phone. Got him two of these and he hasn't complained once in 6 months, which for him is saying something.", verified: true, helpful: 9 },
      { name: "Farid H.", date: "2026-02-24", stars: 5, title: "USB 2 speed for files fyi", text: "charges great. just know its USB 2.0 for data so moving big videos off my phone to my laptop takes forever. if you only need it for charging its perfect", verified: true, helpful: 26 },
    ],
    questions: [
      { q: "Will this charge an iPhone 15?", a: "yes, iPhone 15 and 16 are USB-C so it works", by: "Olivia", date: "2026-04-17", votes: 15 },
      { q: "Does it support fast charging on Galaxy phones?", a: "Yes. The cable carries up to 60 W, so it supports fast charging when used with a fast charger.", by: "Seller", date: "2025-06-05", votes: 10 },
      { q: "Can I transfer photos with it?", a: "yes but it's slow, usb 2 speed", by: "Redbird Customer", date: "2024-08-24", votes: 7 },
      { q: "Will it charge a MacBook Air?", a: "Yes. It carries up to 60 W, which is enough to charge a MacBook Air or a Chromebook when it is plugged into a USB-C fast charger.", by: "Seller", date: "2024-07-08", votes: 9 },
    ],
  },

  'kestrel-buds': {
    summary: "For the price, the noise cancelling does well on buses, trains and planes, and the battery gets close to the 8 hours listed. They stay in during workouts. The complaints are about fit for smaller ears, a muffled mic on calls, and the occasional earbud that stops charging.",
    aspects: [
      { name: "Noise cancelling", good: 1880, bad: 260 },
      { name: "Battery life", good: 1420, bad: 150 },
      { name: "Sound quality", good: 1560, bad: 310 },
      { name: "Fit", good: 1090, bad: 420 },
      { name: "Microphone", good: 380, bad: 290 },
    ],
    reviews: [
      { name: "Bianca F.", date: "2026-05-19", stars: 5, title: "Great on the train", text: "I take a 50 minute train every morning and these block out most of the rumble and people talking. Not perfect but for 50 bucks I'm happy.", verified: true, helpful: 63 },
      { name: "Jordan Kim", date: "2025-04-16", stars: 4, title: "Good sound, fit is a little big", text: "Sound is good, bass is decent. The tips they come with were too big for me, switched to the small ones in the box and it's better but my ears still get sore after a couple hours.", verified: true, helpful: 18 },
      { name: "Danny V.", date: "2025-10-08", stars: 1, title: "Left earbud stopped charging", text: "After about 2 months the left one stopped charging in the case. Cleaned the contacts, nothing. Annoying because they were good until then.", verified: true, helpful: 41 },
      { name: "Tyler Moss", date: "2024-08-27", stars: 5, title: "My gym earbuds", text: "Use them at the gym 5 days a week, sweat all over them and they still work. They don't fall out on the treadmill", verified: true, helpful: 12 },
      { name: "Aisha N.", date: "2024-10-03", stars: 3, title: "Mic is bad for calls", text: "Fine for music. On calls people keep saying I sound far away and muffled, worse when I'm outside. I gave up using them for work calls, the mic just isn't good enough", verified: true, helpful: 37 },
      { name: "Carlos E.", date: "2025-07-09", stars: 5, title: "Battery is legit", text: "Flew to Lisbon and used them the whole flight with noise cancelling on, got around 7 and a half hours before they died. Case recharged them in about an hour.", verified: true, helpful: 29 },
    ],
    questions: [
      { q: "Do they work with Android?", a: "Yes. They connect over Bluetooth to Android phones, iPhones, tablets and laptops.", by: "Seller", date: "2026-04-12", votes: 9 },
      { q: "How long does the case take to charge?", a: "about 2 hours from empty for me", by: "Redbird Customer", date: "2026-08-30", votes: 6 },
    ],
  },

  'northloop-studio-headphones': {
    summary: "Comfort is what owners mention most. The soft cushions work for long listening, the battery goes for days, and they fold flat for travel. On the downside, ears get warm after a few hours, the fit is tight on larger heads, and the Sand color stains easily.",
    aspects: [
      { name: "Comfort", good: 620, bad: 95 },
      { name: "Battery life", good: 540, bad: 20 },
      { name: "Sound quality", good: 480, bad: 88 },
      { name: "Portability", good: 260, bad: 30 },
      { name: "Color and finish", good: 120, bad: 64 },
    ],
    reviews: [
      { name: "Naomi Feld", date: "2026-06-16", stars: 5, title: "So comfortable", text: "Wore these for a 6 hour work session and forgot I had them on. Cushions are really soft. I charge them maybe once a week.", verified: true, helpful: 24, variant: "Color: Sage" },
      { name: "Daniel Osei", date: "2026-04-09", stars: 5, title: "60 hours is real", text: "Haven't actually run them dead yet. Charged them out of the box two weeks ago and they say 30% left. I use them about 2-3 hours a day.", verified: true, helpful: 17, variant: "Color: Black" },
      { name: "Rachel T.", date: "2026-08-25", stars: 2, title: "Sand color stained fast", text: "The Sand looked like a nice beige in the photos but the ear cushions turned grayish and stained within a month from my hair products. Should have gotten black. Sound is fine.", verified: true, helpful: 31, variant: "Color: Sand", photo: 0 },
      { name: "Ivan P.", date: "2026-07-18", stars: 4, title: "Hot ears", text: "Sound is good, nice bass, and the battery lasts forever. My ears get hot after a couple hours though, in the summer its rough", verified: true, helpful: 9, variant: "Color: Midnight blue" },
      { name: "bigtony77", date: "2026-05-06", stars: 3, title: "Tight on big heads", text: "I have a big head and these squeeze even on the biggest setting. Fine for an hour, then I need a break", verified: true, helpful: 13, variant: "Color: Black" },
      { name: "Leah Goldberg", date: "2026-03-23", stars: 5, title: "Great for flights", text: "Fold flat into my backpack. Used them on a flight to Tokyo and the battery barely moved.", verified: true, helpful: 6, variant: "Color: Midnight blue" },
      { name: "Steve Jabs", date: "2025-11-17", stars: 5, title: "One more thing", text: "Great sound. Oh, and one more thing, they fold flat.", verified: true, helpful: 4, variant: "Color: Midnight blue" },
    ],
    questions: [
      { q: "Do these have noise cancelling?", a: "No. The cushions block some outside sound, but these do not have active noise cancelling.", by: "Seller", date: "2026-04-15", votes: 28 },
      { q: "Can you use them with a cable?", a: "i don't think so, mine didn't come with an aux cable", by: "Ivan", date: "2026-07-24", votes: 5 },
      { q: "Is the Sage color more green or gray?", a: "grayish green, kind of muted. not bright at all", by: "Naomi", date: "2026-06-29", votes: 11 },
      { q: "Do they fold up for a backpack?", a: "yes the cups swivel and fold flat. mine go in my carry-on no problem", by: "Priyanka", date: "2025-08-18", votes: 5 },
    ],
  },

  'fernway-phone-case': {
    summary: "Shoppers describe the case as soft and grippy, with a good fit and enough protection for everyday drops. The color choices are popular, though lighter ones like Sand and Sky blue get dirty over time, and the silicone picks up pocket lint.",
    aspects: [
      { name: "Fit", good: 2100, bad: 180 },
      { name: "Grip", good: 1650, bad: 90 },
      { name: "Protection", good: 1320, bad: 240 },
      { name: "Color", good: 1480, bad: 360 },
      { name: "Lint and dirt", good: 60, bad: 540 },
    ],
    reviews: [
      { name: "Grant H.", date: "2026-07-31", stars: 4, title: "Case is great, the color picker on the site is not", text: "I'm blind and use VoiceOver on my iPhone. The case is great, soft and grippy and it fits perfectly, no complaints there. Ordering it was the problem. VoiceOver didn't say anything for the color circles on the product page, no names, nothing, so I had no idea which one I was picking. Ended up asking my neighbor to come over and look at the screen with me. Got Charcoal, which is what I wanted. Would be 5 stars if I could have done it myself.", verified: true, helpful: 112, variant: "Color: Charcoal" },
      { name: "Emily S.", date: "2026-05-23", stars: 5, title: "Soft and grippy", text: "Feels so nice in my hand and doesn't slide off the arm of the couch anymore. Lavender is really pretty, a little more blue than the picture.", verified: true, helpful: 19, variant: "Color: Lavender", photo: 0 },
      { name: "Jorge M.", date: "2024-08-17", stars: 5, title: "survived a drop", text: "dropped my phone face down on concrete in a parking lot. the raised edge saved the screen. case has a scuff, phone is fine", verified: false, helpful: 44, variant: "Color: Charcoal" },
      { name: "Kristy A.", date: "2025-07-04", stars: 2, title: "Sand color got dirty", text: "Within 3 weeks the Sand had dark marks around the edges where my hand holds it. Cant wash it off. Get a darker color", verified: true, helpful: 27, variant: "Color: Sand" },
      { name: "Kayla P.", date: "2025-05-11", stars: 5, title: "Cardinal red is gorgeous", text: "Deep red, not orangey at all. Fits my iPhone 16 perfectly and the buttons are easy to press through it.", verified: false, helpful: 8, variant: "Color: Cardinal red" },
      { name: "Bea", date: "2025-04-18", stars: 5, title: "3rd one", text: "This is my 3rd one, I just switch colors when I get bored", verified: true, helpful: 3, variant: "Color: Sky blue" },
      { name: "Paul Westbrook", date: "2025-11-14", stars: 5, title: "Fits well", text: "Fits my phone well and covers the camera bump. Good price.", verified: true, helpful: 0, variant: "Color: Charcoal" },
    ],
    questions: [
      { q: "Will this fit the iPhone 16 Plus?", a: "No. This case fits 6.1-inch phones only, such as iPhone 16 and iPhone 15. The 16 Plus is larger.", by: "Seller", date: "2024-03-30", votes: 34 },
      { q: "Does it work with wireless charging?", a: "yes I charge through it every night no issues", by: "Emily", date: "2026-06-02", votes: 22 },
      { q: "Is the Sage green more green or gray?", a: "kind of a soft gray green, like dried herbs", by: "Redbird Customer", date: "2025-08-11", votes: 6 },
      { q: "Does it work with a car mount?", a: "yes, i use a vent mount with the case on and it holds fine", by: "Marco", date: "2024-05-19", votes: 3 },
    ],
  },

  'pebble-10k-powerbank': {
    summary: "It's thin and light enough to carry every day and charges a phone about twice, so it goes along on trips, to concerts and on long days out. It takes a long time to recharge itself. A few had one stop holding a charge after a couple of months.",
    aspects: [
      { name: "Capacity", good: 1420, bad: 190 },
      { name: "Size", good: 1310, bad: 70 },
      { name: "Charging speed", good: 880, bad: 160 },
      { name: "Recharge time", good: 210, bad: 330 },
    ],
    reviews: [
      { name: "Zoe Hart", date: "2025-09-27", stars: 5, title: "Kept my phone alive at a 3 day festival", text: "3 days at a music festival and this kept my phone alive the whole time. Got about 2 full charges out of it each time before I recharged it at the charging tent by the campsite.", verified: true, helpful: 38 },
      { name: "Tim Ostrowski", date: "2026-04-05", stars: 5, title: "Thin", text: "Actually fits in my back jeans pocket. Heavier than it looks though.", verified: true, helpful: 6 },
      { name: "Wes T.", date: "2025-08-18", stars: 3, title: "Slow to recharge", text: "Takes like 5 hours to charge back up from empty with my 20w charger. fine if you do it overnight, not so fine when you forgot and need it in an hour", verified: false, helpful: 22 },
      { name: "Gloria D.", date: "2025-10-06", stars: 1, title: "Stopped holding a charge", text: "Worked great for 2 months then it would go from full to dead in a day without me even using it. Returned it.", verified: true, helpful: 19 },
      { name: "Pedro C.", date: "2025-04-02", stars: 5, title: "One port is enough", text: "I worried one port would be annoying but it's simple, the same cable charges the bank and charges my phone.", verified: false, helpful: 4 },
      { name: "Ana Lucía B.", date: "2025-06-28", stars: 4, title: "Good for travel", text: "Brought it on a plane in my carry on no problem. Gets a little warm if I use my phone while it's charging from it.", verified: false, helpful: 8 },
      { name: "Shira Cohen", date: "2024-09-02", stars: 5, title: "Lives in my commute bag", text: "Keep it in my bag for the commute. Charges my Pixel from 20 to full with juice left over.", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Can I take this on a plane?", a: "Yes. At 10,000 mAh it is within airline limits for carry-on bags. Do not pack it in checked luggage.", by: "Seller", date: "2025-05-14", votes: 40 },
      { q: "How do you know how much battery is left?", a: "4 little dots on the side light up", by: "Zoe", date: "2025-10-04", votes: 7 },
      { q: "Can it charge two things at once?", a: "no only one port", by: "Redbird Customer", date: "2025-06-23", votes: 9 },
      { q: "Does it come with a cable?", a: "yes, a usb-c to usb-c cable and a little travel pouch", by: "Haruto", date: "2026-04-30", votes: 8 },
    ],
  },

  'lumen-orb-speaker': {
    summary: "Reviewers are split. The sound is full for the size and the light ring clock is handy on a nightstand or kitchen counter, so it often doubles as an alarm clock or a speaker for cooking. But voice commands get misheard a lot, Wi-Fi setup frustrated people, and the light ring is too bright at night.",
    aspects: [
      { name: "Sound quality", good: 980, bad: 210 },
      { name: "Voice commands", good: 520, bad: 480 },
      { name: "Setup", good: 310, bad: 390 },
      { name: "Light ring clock", good: 640, bad: 220 },
      { name: "Alarm", good: 410, bad: 70 },
    ],
    reviews: [
      { name: "Monique T.", date: "2026-05-11", stars: 5, title: "Better sound than I expected", text: "It's small but it fills my kitchen. I play podcasts while cooking and can hear it over the stove fan.", verified: true, helpful: 15 },
      { name: "Redbird Customer", date: "2026-03-24", stars: 1, title: "Could not get it on wifi", text: "Spent an hour trying to connect it to our wifi. The app kept saying try again. It finally worked on the 5th try after I restarted my router. A week later it dropped off and I had to do it all again. Returning", verified: true, helpful: 46 },
      { name: "Hank Peterson", date: "2025-07-05", stars: 5, title: "Good alarm clock", text: "Replaced my old alarm clock. I can see the time on the light ring and tell it to snooze without opening my eyes.", verified: true, helpful: 21 },
      { name: "Chloe W.", date: "2026-08-28", stars: 2, title: "Light ring too bright", text: "I can't find a way to fully turn off the ring at night. It lights up the whole bedroom. Moved it to the kitchen.", verified: true, helpful: 33 },
      { name: "Isaac Bloom", date: "2026-06-12", stars: 3, title: "Doesn't understand me half the time", text: "Sound is good. But I ask it to play something and it plays something totally different, or it says sorry I didn't get that. My accent maybe? My wife has better luck with it.", verified: true, helpful: 28 },
      { name: "Joyce A.", date: "2026-10-06", stars: 5, title: "Got it for my mother", text: "My mom lives alone and she uses it to ask the weather and play her old music, she really likes it. Setup was kind of a pain though, took us three tries to get it on her wifi. If its a gift set it up first", verified: true, helpful: 11 },
    ],
    questions: [
      { q: "Can you turn off the light ring?", a: "you can dim it in the app but I couldn't get it fully off", by: "Chloe", date: "2026-09-01", votes: 30 },
      { q: "Does it need Wi-Fi or can it be just Bluetooth?", a: "It works as a Bluetooth speaker without Wi-Fi. Voice commands and the clock need Wi-Fi.", by: "Seller", date: "2026-04-20", votes: 18 },
    ],
  },

  // ── Home & kitchen ───────────────────────────────────────────────────────
  'hearth-oak-kettle': {
    summary: "Coffee drinkers like the thin spout for slow pours, and say the kettle heats fast and holds the exact temperature they set. The keep-warm setting is handy for a second cup. The lid is stiff and hard to open, and 1 liter is small for more than two people.",
    aspects: [
      { name: "Temperature control", good: 690, bad: 38 },
      { name: "Pouring", good: 610, bad: 42 },
      { name: "Heating speed", good: 480, bad: 55 },
      { name: "Size", good: 140, bad: 120 },
      { name: "Lid", good: 60, bad: 180 },
    ],
    reviews: [
      { name: "Owen Marsh", date: "2026-04-07", stars: 5, title: "Boils in about 4 minutes", text: "Full liter takes about 4 minutes to boil, bit less if I set it to 200 for coffee. The spout pours really slow and steady which is the whole reason I bought it. keep warm is nice when I want a second cup", verified: true, helpful: 61, variant: "Color: Matte black", photo: 0 },
      { name: "Barbara N.", date: "2026-06-22", stars: 3, title: "Lovely kettle, but the lid is hard for me", text: "I have arthritis in both hands and the lid is a struggle for me. You have to pull it straight up and it fits very snug. Some mornings I wedge a spoon under the edge to get it off. The rest of it I love, the temperature numbers are easy to read and the handle is comfortable to hold. If they made one with a hinged lid or a button to open it I would buy it again in a heartbeat.", verified: true, helpful: 58, variant: "Color: Cream" },
      { name: "Kenji Watanabe", date: "2026-03-14", stars: 5, title: "Green tea at the right temp", text: "Finally I can make green tea at 175 without guessing. Holds the temperature exactly", verified: true, helpful: 19, variant: "Color: Sage" },
      { name: "Redbird Customer", date: "2026-08-10", stars: 4, title: "Small", text: "Great kettle but 1 liter is only enough for 2 big mugs, or one pour over and a tea. For my family of 4 I'm filling it twice.", verified: true, helpful: 14, variant: "Color: Matte black" },
      { name: "Sofia Andersson", date: "2025-06-03", stars: 5, title: "Cream color is beautiful", text: "looks so nice on the counter. the cream is more of a soft off white, I was worried it would be yellowish and its not", verified: true, helpful: 8, variant: "Color: Cream" },
      { name: "Will Duncan", date: "2025-11-09", stars: 5, title: "pour over guy approved", text: "been making pour over for years with a stovetop kettle. this is way more consistent. the display on the base is easy to read", verified: true, helpful: 23, variant: "Color: Matte black" },
      { name: "Priscilla M.", date: "2026-07-20", stars: 4, title: "Matte finish shows water spots", text: "Works perfectly. The matte black shows water spots and fingerprints so I wipe it down every day.", verified: true, helpful: 5, variant: "Color: Matte black" },
      { name: "ted", date: "2026-02-19", stars: 5, title: "Good", text: "good kettle", verified: true, helpful: 0, variant: "Color: Sage" },
    ],
    questions: [
      { q: "Does it shut off automatically?", a: "Yes. It turns off when the water reaches the set temperature, and again after one hour on keep warm.", by: "Seller", date: "2026-04-16", votes: 26 },
      { q: "Is the inside all stainless or is there plastic?", a: "inside is all steel. the lid has a plastic knob on top but the water doesn't really touch it", by: "Owen", date: "2026-05-25", votes: 17 },
      { q: "Can you set it in Celsius?", a: "yes, hold the C/F button for a few seconds", by: "Redbird Customer", date: "2026-07-01", votes: 9 },
      { q: "How long does it take to boil a full kettle?", a: "about 4 minutes for the full liter", by: "Redbird Customer", date: "2025-09-14", votes: 7 },
    ],
  },

  'hearth-oak-mug-set': {
    summary: "Customers say the mugs are a nice size, feel solid and look better in person than in the photos. They're a popular gift and a common way to replace a cabinet of mismatched mugs. A few arrived chipped, and the handles can get hot in the microwave.",
    aspects: [
      { name: "Look", good: 640, bad: 30 },
      { name: "Size", good: 410, bad: 45 },
      { name: "Sturdiness", good: 360, bad: 58 },
      { name: "Handle", good: 180, bad: 60 },
      { name: "Arrived damaged", good: 4, bad: 62 },
    ],
    reviews: [
      { name: "Julia R.", date: "2026-03-21", stars: 5, title: "Prettier in person", text: "the speckles are a little different on each one which I love. 14 oz is a good size for my big morning coffee", verified: true, helpful: 22, photo: 0 },
      { name: "Nancy H.", date: "2025-08-09", stars: 2, title: "One arrived chipped", text: "Box looked fine but one mug had a chip on the rim. Getting a replacement for one mug was a hassle, they wanted me to send back the whole set.", verified: true, helpful: 29 },
      { name: "Gabe Silva", date: "2025-08-02", stars: 5, title: "Heavy in a good way", text: "Nice thick mugs. Been through the dishwasher probably 50 times and no fading", verified: true, helpful: 11 },
      { name: "Anita Deshpande", date: "2026-05-16", stars: 5, title: "Gift for my sister", text: "Gave these to my sister for her new apartment and she loved them. Packed really well.", verified: false, helpful: 6 },
      { name: "Craig L.", date: "2026-09-27", stars: 4, title: "Handle gets hot", text: "Nice mugs. The handle gets pretty hot in the microwave after 2 minutes so be careful.", verified: true, helpful: 8 },
      { name: "Maya", date: "2026-04-13", stars: 5, title: "So cute", text: "perfect farmhouse look for our kitchen", verified: false, helpful: 3 },
      { name: "Roberto A.", date: "2026-07-08", stars: 5, title: "Finally matching mugs", text: "We had like 15 random mugs from old jobs and conferences. Donated them and got two sets of these. The cabinet looks so much better", verified: true, helpful: 14 },
      { name: "Helen F.", date: "2025-11-11", stars: 5, title: "Handle fits my whole hand", text: "Handle fits my whole hand, not just two fingers. Nice weight.", verified: true, helpful: 4 },
    ],
    questions: [
      { q: "Are these oven safe?", a: "These mugs are safe in the microwave and dishwasher. We do not recommend putting them in the oven.", by: "Seller", date: "2026-03-28", votes: 12 },
      { q: "How tall are they?", a: "around 4 inches I think", by: "Julia", date: "2026-04-04", votes: 5 },
      { q: "Does the speckle pattern feel bumpy?", a: "no it's smooth, the speckles are under the glaze", by: "Redbird Customer", date: "2026-08-19", votes: 3 },
    ],
  },

  'tidewell-french-press': {
    summary: "This press makes strong, smooth coffee, reviewers say, and the fine filter keeps most grounds out. It's simple to use and easy to clean. The glass cracked for some people, and a little sludge still reaches the bottom of the cup.",
    aspects: [
      { name: "Coffee taste", good: 1980, bad: 140 },
      { name: "Filter", good: 1460, bad: 380 },
      { name: "Ease of cleaning", good: 1100, bad: 210 },
      { name: "Value", good: 1240, bad: 60 },
      { name: "Glass durability", good: 260, bad: 520 },
    ],
    reviews: [
      { name: "Victor Hale", date: "2025-06-05", stars: 5, title: "Makes great coffee", text: "coarse ground beans, wait 4 min, press it down and you're done. Coffee comes out strong and smooth. The 34 oz is about 3 of my mugs", verified: true, helpful: 34 },
      { name: "Gerald P.", date: "2026-02-27", stars: 1, title: "Glass cracked", text: "Glass cracked down the side the second week when I poured boiling water in. It says heat safe. Maybe I got a bad one.", verified: true, helpful: 51 },
      { name: "Nora B.", date: "2025-07-29", stars: 5, title: "Cold brew too", text: "Use it for cold brew in the fridge overnight, works great.", verified: false, helpful: 13 },
      { name: "Sanjay R.", date: "2026-04-19", stars: 4, title: "Bit of sludge", text: "Filter is good but there's still a little sludge in the last sip. Normal for a French press I think. Just don't drink the last bit lol", verified: false, helpful: 9 },
      { name: "Lauren E.", date: "2024-11-13", stars: 5, title: "Easy to clean", text: "Way easier to clean than the drip machine we had. You just unscrew the filter and rinse it", verified: true, helpful: 7 },
      { name: "Mohammed K.", date: "2026-06-24", stars: 5, title: "Camping coffee", text: "Brought it car camping and boiled water on the camp stove. The glass made it through a bumpy dirt road wrapped in a towel.", verified: false, helpful: 6 },
      { name: "Jess T.", date: "2025-03-31", stars: 5, title: "Not going back", text: "Bought it after my coffee maker died and I don't think I'm going back", verified: true, helpful: 18 },
    ],
    questions: [
      { q: "Can I get a replacement glass if it breaks?", a: "Yes. Please contact us through your order page and we can send a replacement glass carafe.", by: "Seller", date: "2026-03-06", votes: 23 },
      { q: "How many cups does it really make?", a: "about 3 normal mugs or 4 small cups", by: "Victor", date: "2025-06-18", votes: 15 },
    ],
  },

  'hearth-oak-skillet': {
    summary: "Cooks praise the even heat, the sear it gives a steak, and how easily it goes from the stove to the oven. The seasoning gets better the more they cook with it. It's very heavy to lift with one hand, and a few got one with rust spots or patchy seasoning.",
    aspects: [
      { name: "Cooking performance", good: 1520, bad: 70 },
      { name: "Seasoning", good: 880, bad: 240 },
      { name: "Size", good: 360, bad: 90 },
      { name: "Weight", good: 210, bad: 430 },
    ],
    reviews: [
      { name: "Luke Ferraro", date: "2025-02-26", stars: 5, title: "Great sear", text: "Steaks come out with a great crust. Takes a few minutes to heat up but then it holds heat really well. Made cornbread in the oven in it too.", verified: true, helpful: 27 },
      { name: "Redbird Customer", date: "2025-08-14", stars: 3, title: "Arrived with a rust spot", text: "There was a small rust spot on the bottom when I opened it. I scrubbed it and re-seasoned it in the oven and its fine now. Still, it says ready to use so I didn't expect to have to do that", verified: true, helpful: 22 },
      { name: "Diane K.", date: "2026-05-21", stars: 4, title: "Heavy", text: "5 pounds is a lot when you're trying to lift it with one hand to pour something out. Use two hands. Cooks great.", verified: true, helpful: 16 },
      { name: "Jackson T.", date: "2025-09-04", stars: 5, title: "Eggs don't stick anymore", text: "First week eggs stuck. Kept cooking bacon and stuff in it and now a month later eggs slide right off.", verified: true, helpful: 31 },
      { name: "Amara E.", date: "2025-05-28", stars: 5, title: "Took it camping", text: "Cooked over the campfire grate all weekend. Hash browns, sausage, the works", verified: true, helpful: 7 },
      { name: "Phil G.", date: "2025-07-16", stars: 4, title: "10 inch is a little small", text: "Good pan. 10 in is small for a family though, I can fit 2 steaks max.", verified: true, helpful: 5 },
      { name: "Rosa", date: "2025-02-12", stars: 5, title: "Love it", text: "my first cast iron and it's great", verified: true, helpful: 2 },
      { name: "Ming Zhao", date: "2025-09-08", stars: 5, title: "Works on induction", text: "Using it on my induction cooktop, no issues, heats evenly.", verified: true, helpful: 9 },
    ],
    questions: [
      { q: "Is it ok on a glass top stove?", a: "yes just lift it, don't slide it around", by: "Diane", date: "2026-06-01", votes: 18 },
      { q: "Can I put it in the dishwasher?", a: "No. Hand wash it with hot water and dry it right away to keep the seasoning and prevent rust.", by: "Seller", date: "2026-04-10", votes: 25 },
    ],
  },

  'tidewell-towel-set': {
    summary: "Most buyers find these towels thick, soft and a good size, and say the colors last through many washes. They shed lint for the first few washes and take a while to dry in a bathroom without a window.",
    aspects: [
      { name: "Softness", good: 920, bad: 70 },
      { name: "Thickness", good: 610, bad: 40 },
      { name: "Color", good: 420, bad: 90 },
      { name: "Drying time", good: 180, bad: 210 },
      { name: "Shedding", good: 50, bad: 360 },
    ],
    reviews: [
      { name: "Kim Nguyen", date: "2026-04-24", stars: 5, title: "Like hotel towels", text: "Thick and soft. Feel like the ones at a nice hotel. Washed them 3 times so far and they're still soft.", verified: true, helpful: 26, variant: "Color: Slate" },
      { name: "Lorena C.", date: "2026-07-10", stars: 2, title: "So much lint", text: "Lint everywhere for the first 4 washes. On me, on the floor, on my black clothes in the dryer. It's finally slowing down", verified: true, helpful: 32, variant: "Color: White" },
      { name: "Gwen Harper", date: "2026-05-29", stars: 5, title: "Blush is pretty", text: "Blush is a soft dusty pink and matches my bathroom. Big enough to wrap all the way around.", verified: true, helpful: 9, variant: "Color: Blush", photo: 0 },
      { name: "Ahmed S.", date: "2025-08-23", stars: 3, title: "Slow to dry", text: "Soft but they take forever to dry hanging in our bathroom, there's no window. They get a bit musty if I don't throw them in the dryer.", verified: true, helpful: 14, variant: "Color: Sage green" },
      { name: "Lori P.", date: "2025-10-29", stars: 5, title: "Still good after lots of washes", text: "Had these 6 months and washed them probably 30 times. No fraying and the color still looks good.", verified: true, helpful: 11, variant: "Color: Sage green" },
      { name: "Kev", date: "2026-03-17", stars: 4, title: "nice", text: "nice towels. wish they were abit longer, i'm 6 foot 3", verified: true, helpful: 2, variant: "Color: Slate" },
      { name: "Esther W.", date: "2026-06-15", stars: 5, title: "Bought a second set", text: "Bought another set in white for the guest bathroom.", verified: true, helpful: 3, variant: "Color: White" },
      { name: "Nadia F.", date: "2026-10-05", stars: 5, title: "Absorbent", text: "Dries me off in one pass, I don't need a second towel for my hair.", verified: true, helpful: 6, variant: "Color: Slate" },
    ],
    questions: [
      { q: "Are these bath towels or bath sheets?", a: "They are bath towels, 30 × 56 inches each.", by: "Seller", date: "2026-04-29", votes: 13 },
      { q: "Does the white get dingy?", a: "mine are still white after a few months but i use bleach sometimes", by: "Esther", date: "2026-07-06", votes: 6 },
      { q: "Is Slate more blue or gray?", a: "Gray with a little blue in it, darker than it looks in the picture", by: "Redbird Customer", date: "2026-05-12", votes: 9 },
      { q: "Can I use fabric softener on these?", a: "We recommend skipping fabric softener. Machine wash warm and tumble dry low.", by: "Seller", date: "2026-06-20", votes: 4 },
    ],
  },

  'fernway-throw-blanket': {
    summary: "People love how soft and heavy it is and how it looks on a couch or bed, and lots of them buy it as a gift. It sheds a little at first and can lose its shape in the wash. A few thought it was smaller than expected.",
    aspects: [
      { name: "Look", good: 520, bad: 25 },
      { name: "Softness", good: 410, bad: 30 },
      { name: "Warmth", good: 300, bad: 20 },
      { name: "Size", good: 190, bad: 110 },
      { name: "Washing", good: 120, bad: 140 },
    ],
    reviews: [
      { name: "Allison G.", date: "2026-03-03", stars: 5, title: "Looks so good on our couch", text: "the oatmeal color goes with everything. its heavy and cozy and my cat has already claimed it", verified: true, helpful: 18, variant: "Color: Oatmeal", photo: 0 },
      { name: "Wanda S.", date: "2026-05-09", stars: 2, title: "Stretched out after washing", text: "Washed on gentle like it says and laid it flat to dry. Still came out stretched and lumpy in places.", verified: true, helpful: 24, variant: "Color: Charcoal" },
      { name: "Frank D.", date: "2026-02-21", stars: 5, title: "Valentine's gift", text: "Got the red one for my wife for Valentine's Day and she uses it every night. It's a deep red, not bright.", verified: true, helpful: 12, variant: "Color: Cardinal red" },
      { name: "Selena M.", date: "2026-09-20", stars: 4, title: "Smaller than I thought", text: "50 by 60 is fine for one person on the couch but it doesn't cover my bed at all. Should have measured. Very soft though.", verified: true, helpful: 10, variant: "Color: Oatmeal" },
      { name: "Hugo R.", date: "2026-04-01", stars: 5, title: "Heavy and warm", text: "Its almost like a weighted blanket but not quite. Keeps me warm and I don't get sweaty under it", verified: true, helpful: 6, variant: "Color: Charcoal" },
      { name: "Aditi", date: "2026-10-13", stars: 4, title: "Some shedding", text: "Little fuzz balls on the couch the first week. Stopped after that. Still love it", verified: true, helpful: 4, variant: "Color: Oatmeal" },
      { name: "Rebecca J.", date: "2026-08-14", stars: 5, title: "Bought 2", text: "Bought 2 because it was on sale. One for the couch and one for my reading chair.", verified: true, helpful: 3, variant: "Color: Cardinal red" },
    ],
    questions: [
      { q: "Can it go in the dryer?", a: "We recommend laying it flat to dry. A dryer can stretch the knit.", by: "Seller", date: "2026-03-12", votes: 15 },
      { q: "Is it actually hand knit?", a: "pretty sure it's machine made, it just has the chunky hand knit look", by: "Redbird Customer", date: "2026-05-30", votes: 11 },
      { q: "Will it fit a twin bed?", a: "it covers the top of a twin but won't hang over the sides", by: "Selena", date: "2026-09-24", votes: 4 },
    ],
  },

  'lumen-desk-lamp': {
    summary: "The lamp is bright, the bendable arm is easy to aim, and reviewers use the warm-to-cool settings for reading or working late. The touch controls are too sensitive for some, and a few say the arm starts to droop after a couple of months.",
    aspects: [
      { name: "Brightness", good: 680, bad: 55 },
      { name: "Light color options", good: 520, bad: 40 },
      { name: "Arm", good: 310, bad: 150 },
      { name: "Look", good: 240, bad: 30 },
      { name: "Touch controls", good: 210, bad: 260 },
    ],
    reviews: [
      { name: "Marguerite L.", date: "2026-06-26", stars: 5, title: "Finally I can read my mail", text: "I have macular degeneration and I need a lot of light to read. With it on the brightest cool setting and the arm pulled right over the page I can read my mail and even my pill bottles without the magnifier. The touch buttons are a little hard to find by feel. I put one of those small bump stickers on the on/off button and now I have no trouble.", verified: true, helpful: 74 },
      { name: "Ryan Cho", date: "2026-04-11", stars: 4, title: "Too sensitive", text: "Bright and nice light but the touch button turns on if I brush it with my sleeve. Happens a few times a day.", verified: true, helpful: 19 },
      { name: "Trevor J.", date: "2025-07-19", stars: 1, title: "Arm won't stay up", text: "After 2 months the arm slowly droops and won't hold the position. It's basically pointing at the base now.", verified: true, helpful: 28 },
      { name: "Jasmine T.", date: "2025-09-22", stars: 5, title: "Late night studying", text: "I use the warm setting at night in my dorm so it doesn't bother my roommate, and the cool bright one during the day.", verified: true, helpful: 11 },
      { name: "Paulo N.", date: "2026-03-20", stars: 5, title: "Better video calls", text: "I point it at the wall behind my laptop and I look way better on work video calls.", verified: true, helpful: 7 },
      { name: "Jony Ivory", date: "2025-09-17", stars: 5, title: "Simple", text: "One button. No more, no less. Could be a little more white.", verified: true, helpful: 1 },
      { name: "A. Mensah", date: "2026-10-15", stars: 5, title: "Colors look right", text: "I paint miniatures and the light shows colors accurately. It doesn't make reds look orange like my old lamp did", verified: true, helpful: 13 },
    ],
    questions: [
      { q: "Does it have a USB port or wireless charger for my phone?", a: "This model does not have a USB port or a wireless charger. It is a lamp only and plugs into the wall.", by: "Seller", date: "2026-04-22", votes: 21 },
      { q: "Does it remember the last brightness?", a: "yes mine comes back on at the same setting", by: "Ryan", date: "2026-05-07", votes: 8 },
      { q: "Does it clamp to the desk?", a: "no, it has a heavy base", by: "Redbird Customer", date: "2026-07-23", votes: 5 },
    ],
  },

  'fernway-planter': {
    summary: "Most snake plants arrive healthy, and buyers like the clean, simple white pot. Even people who usually kill plants say it's easy to keep alive. Some got a smaller plant than the photo showed, and a few had a cracked pot or bent leaves from shipping.",
    aspects: [
      { name: "Plant health", good: 210, bad: 60 },
      { name: "Pot", good: 180, bad: 35 },
      { name: "Packaging", good: 90, bad: 70 },
      { name: "Plant size", good: 40, bad: 120 },
    ],
    reviews: [
      { name: "Brianna C.", date: "2025-08-22", stars: 5, title: "I haven't killed it", text: "I kill every plant I own. 4 months in and this one is still alive and growing a new leaf. I water it when I remember, about every 2 weeks.", verified: true, helpful: 21, photo: 0 },
      { name: "Liz M.", date: "2026-05-01", stars: 1, title: "Pot arrived cracked", text: "Pot had a crack down one side and there was dirt all over the box. Plant seemed ok.", verified: true, helpful: 18, photo: 1 },
      { name: "Theo M.", date: "2026-08-12", stars: 4, title: "Smaller than the picture", text: "Plant is healthy but it's maybe 10 inches tall, the picture made it look bigger. Pot is nice", verified: true, helpful: 15 },
      { name: "Fiona O.", date: "2026-03-25", stars: 5, title: "Good office plant", text: "Sits on my desk at work with only the overhead lights and it's doing fine.", verified: true, helpful: 6 },
      { name: "Carmen D.", date: "2026-06-17", stars: 2, title: "Leaves were bent", text: "Two of the leaves were folded in half from shipping and they never straightened out. Had to cut them off.", verified: true, helpful: 9 },
      { name: "Jamie", date: "2026-09-10", stars: 4, title: "No drainage hole", text: "pretty pot but no drainage hole so watch how much you water it", verified: true, helpful: 12 },
      { name: "Uma P.", date: "2026-04-15", stars: 5, title: "Housewarming gift", text: "Sent one to a friend's new place and she loved it", verified: true, helpful: 2 },
      { name: "G. Morales", date: "2025-12-09", stars: 5, title: "Nice", text: "Looks great on my bookshelf.", verified: true, helpful: 1 },
    ],
    questions: [
      { q: "Is this safe for cats?", a: "Snake plants can upset a cat's stomach if eaten. We suggest keeping it out of reach of pets.", by: "Seller", date: "2026-04-27", votes: 19 },
      { q: "Does the pot have a drainage hole?", a: "mine doesn't", by: "Jamie", date: "2026-09-12", votes: 10 },
      { q: "How tall is the plant?", a: "mine was about 12 inches from the top of the pot", by: "Redbird Customer", date: "2026-06-03", votes: 7 },
    ],
  },

  // ── Clothing & shoes ─────────────────────────────────────────────────────
  'saltgrass-hoodie': {
    summary: "Wearers say it's soft inside, warm and a good weight for everyday use, and they like the colors and the big front pocket. It shrinks in the dryer and runs a little short in the body, so a few suggest going up a size.",
    fit: "runs a little small, and shrinks if dried hot",
    aspects: [
      { name: "Softness", good: 1420, bad: 60 },
      { name: "Fit", good: 980, bad: 510 },
      { name: "Color", good: 860, bad: 120 },
      { name: "Warmth", good: 690, bad: 30 },
      { name: "Shrinking", good: 70, bad: 340 },
    ],
    reviews: [
      { name: "Alexis M.", date: "2025-09-18", stars: 5, title: "My favorite hoodie now", text: "super soft inside and not too heavy, I wear it every morning now that its getting cold. Forest green is a nice deep green", verified: true, helpful: 33, variant: "Color: Forest green, Size: M", photo: 0 },
      { name: "Brooke H.", date: "2026-03-10", stars: 2, title: "Shrank a full size", text: "Washed it once in warm and dried on medium and now it's short on me. Sleeves too. Size up or air dry it", verified: true, helpful: 47, variant: "Color: Heather gray, Size: L" },
      { name: "Connor B.", date: "2026-02-14", stars: 4, title: "Runs a bit small", text: "normally a large and the L fit more like a snug medium on me. Exchanged it for an XL and that one fits right. really soft", verified: true, helpful: 29, variant: "Color: Navy, Size: XL" },
      { name: "Maribel S.", date: "2026-04-03", stars: 5, title: "Bought for my husband", text: "He wears it every weekend. He's 5'10 and about 180 and the L fits him well.", verified: true, helpful: 8, variant: "Color: Black, Size: L" },
      { name: "Hannah W.", date: "2024-12-01", stars: 5, title: "I live in this on campus", text: "I live in this thing on campus. The pocket fits my phone and my keys. Cardinal red is a true deep red", verified: true, helpful: 12, variant: "Color: Cardinal red, Size: M" },
      { name: "Derek O.", date: "2026-06-07", stars: 4, title: "Pills a little", text: "Some pilling on the sides where my arms rub, after about 2 months. Still comfortable.", verified: true, helpful: 9, variant: "Color: Heather gray, Size: XXL" },
      { name: "Tomoko I.", date: "2026-08-09", stars: 5, title: "Unisex sizing works", text: "I'm usually a womens medium and got the S, its a little loose but not baggy", verified: true, helpful: 14, variant: "Color: Navy, Size: S" },
      { name: "Leo", date: "2026-05-14", stars: 5, title: "Cozy", text: "cozy", verified: true, helpful: 2, variant: "Color: Cardinal red, Size: S" },
    ],
    questions: [
      { q: "Is this men's or women's sizing?", a: "It is unisex sizing. Women may want to order one size down for a closer fit.", by: "Seller", date: "2025-02-20", votes: 31 },
      { q: "Does it shrink?", a: "yes some if you dry it hot. i air dry mine", by: "Alexis", date: "2025-09-23", votes: 22 },
      { q: "Is the Navy close to black?", a: "it's a dark navy, you can tell it's blue in daylight", by: "Redbird Customer", date: "2026-04-08", votes: 6 },
      { q: "Is there a tag in the neck?", a: "no tag, the label is printed on. nice because tags bother me", by: "Jordan", date: "2025-03-12", votes: 11 },
    ],
  },

  'saltgrass-tee-3pack': {
    summary: "The shirts are soft, decently thick for the price, and the classic fit works alone or under a button-up, so people reorder when old ones wear out. The usual complaints: they shrink in length after washing, the white one is a little see-through, and the neck stretches out over time.",
    fit: "boxy, and shrinks if dried hot",
    aspects: [
      { name: "Comfort", good: 1840, bad: 120 },
      { name: "Value", good: 1620, bad: 90 },
      { name: "Thickness", good: 520, bad: 440 },
      { name: "Neck shape", good: 210, bad: 280 },
      { name: "Shrinking", good: 110, bad: 620 },
    ],
    reviews: [
      { name: "Rob Jennings", date: "2026-05-26", stars: 5, title: "Good everyday tees", text: "Soft and a good thickness. I wear the gray and navy by themselves and the white one under my work shirts", verified: true, helpful: 22, variant: "Size: L" },
      { name: "Redbird Customer", date: "2025-09-04", stars: 1, title: "Shrank 2 inches", text: "Washed in cold, dried on low, and they got about 2 inches shorter. Now they're basically crop tops on me. Super disappointed", verified: true, helpful: 39, variant: "Size: XL" },
      { name: "Javier P.", date: "2024-05-15", stars: 4, title: "White is see-through", text: "Navy and gray are great. You can see through the white one a little.", verified: true, helpful: 18, variant: "Size: M" },
      { name: "Andrew K.", date: "2026-09-12", stars: 5, title: "Reordered 3 times", text: "This is my 3rd pack. Easy to just restock when they wear out", verified: true, helpful: 7, variant: "Size: L" },
      { name: "Sunil V.", date: "2025-08-05", stars: 3, title: "neck stretched", text: "after a few months the neck on the white one got wavy. others ok", verified: true, helpful: 11, variant: "Size: M" },
      { name: "Kyle D.", date: "2025-08-19", stars: 4, title: "Fit is boxy", text: "Classic fit means kind of boxy. Fine for me, just know it's not a slim fit.", verified: true, helpful: 6, variant: "Size: XXL" },
    ],
    questions: [
      { q: "Can I choose the colors in the pack?", a: "The pack always comes with one white, one gray and one navy shirt.", by: "Seller", date: "2025-03-19", votes: 17 },
    ],
  },

  'mesa-trail-runners': {
    summary: "Customers say the shoes are light, comfortable from the first wear and good for both running and walking, with mesh that breathes in hot weather. Sizing is the biggest complaint. They run small and only come in whole sizes. Others had the mesh tear near the toe after a few months, and the white pair gets dirty fast.",
    fit: "runs a little small; whole sizes only",
    aspects: [
      { name: "Comfort", good: 620, bad: 70 },
      { name: "Weight", good: 410, bad: 15 },
      { name: "Grip", good: 260, bad: 40 },
      { name: "Durability", good: 210, bad: 190 },
      { name: "Sizing", good: 180, bad: 360 },
    ],
    reviews: [
      { name: "Matt Reyes", date: "2026-04-16", stars: 5, title: "Light and comfy", text: "Ran 5 miles the first day with no break in. They feel really light.", verified: true, helpful: 18, variant: "Color: Gray / red, Size: 10" },
      { name: "Nikhil S.", date: "2025-08-10", stars: 4, title: "Order a size up", text: "I'm usually a 9 and these were tight in the toes. Exchanged for a 10 and they're perfect. They only come in whole sizes so I had to go up a full size.", verified: true, helpful: 41, variant: "Color: White, Size: 10" },
      { name: "runner_dave", date: "2025-09-05", stars: 1, title: "Mesh ripped", text: "Mesh tore by my big toe after about 3 months of running 3 times a week. Sole still looks new.", verified: true, helpful: 33, variant: "Color: Black, Size: 11" },
      { name: "Ray B.", date: "2026-03-07", stars: 5, title: "Good for being on your feet all day", text: "I'm on my feet 10 hours a day at the warehouse and these are better than the work shoes I had. Good cushion.", verified: true, helpful: 15, variant: "Color: Black, Size: 12" },
      { name: "Kristen L.", date: "2026-07-19", stars: 2, title: "White gets dirty", text: "The white ones looked great for one day. The mesh holds onto dirt and doesn't really come clean.", verified: true, helpful: 12, variant: "Color: White, Size: 8" },
      { name: "Diego Lopes", date: "2026-08-01", stars: 5, title: "Great in hot weather", text: "Ran in 100 degree heat in Phoenix and my feet didn't feel cooked", verified: true, helpful: 8, variant: "Color: Gray / red, Size: 9" },
      { name: "Sean W.", date: "2025-06-13", stars: 4, title: "Grip is good, a bit narrow", text: "Grips well on wet pavement. A little narrow for my wide feet.", verified: true, helpful: 9, variant: "Color: Black, Size: 11" },
      { name: "Elliot", date: "2026-10-03", stars: 5, title: "Good shoes", text: "comfortable, cheap enough, look fine", verified: true, helpful: 0, variant: "Color: Gray / red, Size: 13" },
    ],
    questions: [
      { q: "Do these come in half sizes?", a: "These come in whole sizes only, from 7 to 13.", by: "Seller", date: "2026-04-02", votes: 27 },
      { q: "Are they good for trail running?", a: "easy trails yes, rocky stuff not really, the sole is more for road", by: "Matt", date: "2026-05-08", votes: 12 },
    ],
  },

  'saltgrass-rain-jacket': {
    summary: "It keeps people dry in steady rain and packs small enough for a bag or suitcase, so it goes along on hikes and trips. It can get sweaty inside on warm days. A few find the fit boxy or the sleeves short.",
    fit: "true to size, with room for a sweater",
    aspects: [
      { name: "Packability", good: 410, bad: 12 },
      { name: "Waterproof", good: 380, bad: 45 },
      { name: "Fit", good: 220, bad: 130 },
      { name: "Hood", good: 180, bad: 50 },
      { name: "Breathability", good: 90, bad: 160 },
    ],
    reviews: [
      { name: "Clara J.", date: "2026-03-04", stars: 5, title: "Dry in a downpour", text: "Walked 30 minutes home in a real downpour and stayed completely dry. The hood stays on with the drawstring.", verified: true, helpful: 24, variant: "Color: Olive, Size: M" },
      { name: "Colleen F.", date: "2025-08-13", stars: 2, title: "Sweaty", text: "Keeps the rain out but it's like wearing a trash bag if it's warm out. I was wetter from sweat than I would have been from the rain.", verified: true, helpful: 19, variant: "Color: Navy, Size: L" },
      { name: "Tamsin R.", date: "2026-05-02", stars: 5, title: "Folds into its own pocket", text: "Packs into its own pocket, about the size of a sandwich. It lives in my backpack now.", verified: true, helpful: 13, variant: "Color: Cardinal red, Size: S", photo: 0 },
      { name: "Yolanda P.", date: "2026-09-16", stars: 3, title: "Sleeves are short", text: "I have long arms and the sleeves end above my wrist. Jacket works fine otherwise.", verified: true, helpful: 8, variant: "Color: Olive, Size: L" },
      { name: "Erin K.", date: "2026-04-20", stars: 5, title: "A week in Seattle", text: "Wore it every day in Seattle for a week. Didn't need an umbrella once.", verified: true, helpful: 10, variant: "Color: Navy, Size: M" },
      { name: "Mira", date: "2025-07-27", stars: 4, title: "Boxy", text: "it's a bit boxy but I like having room for a sweater under it", verified: true, helpful: 4, variant: "Color: Olive, Size: XS" },
      { name: "Grace T.", date: "2025-10-07", stars: 5, title: "Easy to see on dog walks", text: "The red is easy to see at dusk when I walk my dog, that's why I picked it.", verified: true, helpful: 6, variant: "Color: Cardinal red, Size: M" },
      { name: "Patti", date: "2026-02-25", stars: 5, title: "Perfect", text: "Light and dry. Perfect", verified: true, helpful: 1, variant: "Color: Navy, Size: XL" },
    ],
    questions: [
      { q: "Does it run small?", a: "true to size for me, with room for a sweater", by: "Clara", date: "2026-03-09", votes: 14 },
      { q: "Is it waterproof or just water resistant?", a: "It is waterproof, rated to 10,000 mm, with taped seams.", by: "Seller", date: "2026-04-14", votes: 11 },
    ],
  },

  'saltgrass-beanie': {
    summary: "Warm, soft and not itchy, even for people who can't usually wear wool, but snug on bigger heads and prone to stretching in the wash.",
    aspects: [
      { name: "Warmth", good: 280, bad: 15 },
      { name: "Itchiness", good: 240, bad: 22 },
      { name: "Fit", good: 190, bad: 70 },
      { name: "Washing", good: 50, bad: 40 },
    ],
    reviews: [
      { name: "Heidi B.", date: "2026-03-01", stars: 5, title: "Not itchy!", text: "I usually can't stand wool on my forehead but this is soft. Wore it all winter in Minneapolis.", verified: true, helpful: 19, variant: "Color: Heather gray" },
      { name: "Austin R.", date: "2026-04-04", stars: 2, title: "Stretched out", text: "Washed it in the machine and it came out way looser and longer. Now it slides down over my eyes. Hand wash this", verified: true, helpful: 17, variant: "Color: Black" },
      { name: "Oscar G.", date: "2026-02-09", stars: 5, title: "Warm", text: "Very warm for how thin it is. Fits under my bike helmet.", verified: true, helpful: 9, variant: "Color: Black" },
      { name: "Pam R.", date: "2026-02-18", stars: 4, title: "Snug on big heads", text: "My husband has a big head and it's snug on him. Fits me perfectly.", verified: true, helpful: 7, variant: "Color: Cardinal red" },
      { name: "Sakura M.", date: "2026-10-04", stars: 5, title: "Bought 2", text: "One gray, one red. You can fold the cuff twice for a shorter look.", verified: true, helpful: 5, variant: "Color: Cardinal red" },
      { name: "Dmitri V.", date: "2026-03-12", stars: 5, title: "Ski trip", text: "Wore it skiing in Tahoe and it kept my ears warm all day.", verified: true, helpful: 6, variant: "Color: Black" },
      { name: "Nell A.", date: "2026-09-28", stars: 5, title: "Doesn't get sweaty", text: "I wear it on cold morning runs and my head doesn't get gross and sweaty like with my acrylic hats.", verified: true, helpful: 11, variant: "Color: Heather gray" },
      { name: "Quinn", date: "2026-02-28", stars: 5, title: "Nice gift", text: "soft and warm. nice gift", verified: true, helpful: 1, variant: "Color: Heather gray" },
    ],
    questions: [
      { q: "Is this 100% merino?", a: "Yes, it is made of merino wool.", by: "Seller", date: "2026-02-11", votes: 8 },
      { q: "Will it fit a kid?", a: "too big for my 8 year old, it slides down. fine on my 13 year old", by: "Pam", date: "2026-02-22", votes: 6 },
      { q: "Does it cover the ears?", a: "yes with the cuff down", by: "Redbird Customer", date: "2026-03-05", votes: 4 },
    ],
  },

  // ── Sports & outdoors ────────────────────────────────────────────────────
  'foxglove-bottle-24oz': {
    summary: "Water stays cold all day, nothing leaks in a bag, and 24 ounces is a good size for work, school or the gym. People like carrying it by the loop cap. The paint chips when it's dropped, and the bottle is too wide for many car cup holders.",
    aspects: [
      { name: "Keeps cold", good: 4920, bad: 110 },
      { name: "Leak proof", good: 3110, bad: 180 },
      { name: "Size", good: 2240, bad: 390 },
      { name: "Cap", good: 1510, bad: 140 },
      { name: "Paint durability", good: 210, bad: 680 },
    ],
    reviews: [
      { name: "Lily Santos", date: "2026-07-15", stars: 5, title: "Ice still there the next morning", text: "Filled it with ice water at 8 am, left it in my car on a hot day, and there was still ice in it when I got home. Then I forgot it on the counter overnight and there was still a little ice in the morning.", verified: true, helpful: 216, variant: "Color: Sage", photo: 0 },
      { name: "Melissa J.", date: "2026-05-20", stars: 2, title: "Paint chipped the first week", text: "Dropped it once on the sidewalk and a big chip of paint came off the bottom. Doesn't change how it works but for 27 dollars I expected better.", verified: true, helpful: 44, variant: "Color: Ocean blue", photo: 1 },
      { name: "Ethan C.", date: "2024-03-18", stars: 5, title: "Doesn't leak", text: "I throw it in my backpack next to my laptop every day and it's never leaked once.", verified: true, helpful: 31, variant: "Color: Black" },
      { name: "Jada M.", date: "2026-08-30", stars: 4, title: "Doesn't fit my cup holder", text: "Great bottle but it's too wide for the cup holder in my car. Have to put it on the floor.", verified: true, helpful: 23, variant: "Color: Cardinal red" },
      { name: "Stan K.", date: "2024-08-01", stars: 5, title: "Gym bottle", text: "24 oz is the right size for an hour at the gym. Loop cap hangs on my finger", verified: true, helpful: 8, variant: "Color: Black" },
      { name: "Vanessa O.", date: "2024-09-24", stars: 5, title: "Glacier white looks so clean", text: "Very clean white color, hasn't stained yet after 3 months of using it every day.", verified: true, helpful: 7, variant: "Color: Glacier white" },
      { name: "Irene H.", date: "2026-04-28", stars: 5, title: "Bought for the whole family", text: "Bought one in every color so the kids would stop fighting over whose is whose. so far so good lol", verified: true, helpful: 19, variant: "Color: Ocean blue" },
      { name: "noah_r", date: "2024-12-12", stars: 5, title: "best", text: "best bottle i've owned", verified: true, helpful: 2, variant: "Color: Sage" },
    ],
    questions: [
      { q: "Can it go in the dishwasher?", a: "We recommend hand washing the bottle to protect the paint. The cap is top-rack dishwasher safe.", by: "Seller", date: "2025-03-24", votes: 52 },
      { q: "Does it fit in a car cup holder?", a: "not in mine (sedan), too wide", by: "Jada", date: "2026-09-02", votes: 29 },
      { q: "Can you put hot coffee in it?", a: "yes, stays hot for hours. the loop cap isn't great for sipping hot stuff though", by: "Redbird Customer", date: "2024-06-16", votes: 13 },
      { q: "Does the outside sweat with ice water?", a: "no, never had a wet ring on my desk", by: "Malik", date: "2025-07-27", votes: 6 },
    ],
  },

  'mesa-trail-daypack': {
    summary: "Hikers say it's light and comfortable and holds enough for a full day, with padded straps and a sleeve for a water bladder. It isn't fully waterproof in heavy rain, and a few say the side pockets are too shallow to hold a bottle securely.",
    aspects: [
      { name: "Comfort", good: 460, bad: 40 },
      { name: "Size", good: 380, bad: 60 },
      { name: "Durability", good: 300, bad: 45 },
      { name: "Pockets", good: 250, bad: 150 },
      { name: "Water resistance", good: 210, bad: 110 },
    ],
    reviews: [
      { name: "Nate Holloway", date: "2026-05-17", stars: 5, title: "Perfect for day hikes", text: "Did 8 miles at Point Reyes with water, lunch, a jacket and my camera. Didn't feel heavy and the straps didn't dig in.", verified: true, helpful: 26, photo: 0 },
      { name: "Corey B.", date: "2025-09-24", stars: 2, title: "Bottle fell out of the side pocket", text: "The side pockets are shallow and my water bottle fell out twice when I bent over. Lost one down a hill", verified: true, helpful: 21 },
      { name: "Meera J.", date: "2026-03-29", stars: 4, title: "Not waterproof", text: "Light rain is fine. Got caught in a real storm and the stuff at the bottom got damp. It says water resistant so that's fair.", verified: true, helpful: 15 },
      { name: "Tobias W.", date: "2025-10-07", stars: 5, title: "Commuter bag too", text: "I use it to bike to work. My laptop fits in the hydration sleeve lol. Light, and my back doesn't get too sweaty.", verified: true, helpful: 9 },
      { name: "Kara L.", date: "2026-08-11", stars: 5, title: "Holds up", text: "Used it most weekends since last fall plus a trip to Zion. No rips, zippers still smooth.", verified: true, helpful: 12 },
    ],
    questions: [
      { q: "Will a 15 inch laptop fit?", a: "mine fits in the hydration sleeve but it's tight", by: "Tobias", date: "2025-10-09", votes: 12 },
      { q: "Does it come with a water bladder?", a: "No. The pack has a sleeve and a hose opening for a water bladder, but the bladder is sold separately.", by: "Seller", date: "2026-04-25", votes: 16 },
      { q: "Is there a chest strap?", a: "yes, it slides up and down", by: "Redbird Customer", date: "2026-06-30", votes: 4 },
      { q: "Is it waterproof?", a: "It is water resistant. The ripstop nylon sheds light rain, but it is not waterproof in a heavy storm.", by: "Seller", date: "2026-05-21", votes: 12 },
    ],
  },

  'foxglove-yoga-mat': {
    summary: "The mat cushions knees well and stays put on hard floors, and the carrying strap is a nice extra. Expect a rubbery smell and curled ends for the first few days. Some also find it slippery once their hands get sweaty.",
    aspects: [
      { name: "Cushioning", good: 1120, bad: 80 },
      { name: "Grip", good: 980, bad: 310 },
      { name: "Durability", good: 410, bad: 190 },
      { name: "Strap", good: 280, bad: 70 },
      { name: "Smell", good: 40, bad: 260 },
    ],
    reviews: [
      { name: "Rosalind K.", date: "2026-04-06", stars: 5, title: "Easy on my knees", text: "6mm is the right thickness for my knees. I don't have to fold it over for kneeling poses anymore.", verified: true, helpful: 21, variant: "Color: Plum" },
      { name: "Nia W.", date: "2025-06-11", stars: 2, title: "Slippery once I sweat", text: "Fine for slow yoga. In hot yoga or any time I'm sweating my hands slide.", verified: true, helpful: 25, variant: "Color: Dusty blue" },
      { name: "Brent M.", date: "2026-02-23", stars: 3, title: "Smell", text: "Strong rubbery smell when I opened it. Left it unrolled on the porch for 2 days and it's mostly gone now.", verified: true, helpful: 17, variant: "Color: Sage" },
      { name: "Jun P.", date: "2026-08-04", stars: 4, title: "Ends curl", text: "The ends curled up for the first week. Rolled it the other way overnight and it flattened out.", verified: true, helpful: 9, variant: "Color: Sage" },
      { name: "Ken L.", date: "2026-06-23", stars: 5, title: "Home workouts", text: "I use it for stretching and floor exercises at home every day. 4 months in, no tears.", verified: true, helpful: 7, variant: "Color: Dusty blue" },
    ],
    questions: [
      { q: "How long is it?", a: "It is 72 inches long and 24 inches wide.", by: "Seller", date: "2025-03-03", votes: 9 },
      { q: "Does it smell?", a: "a little at first, goes away in a few days", by: "Redbird Customer", date: "2026-07-15", votes: 12 },
    ],
  },

  'mesa-trail-lantern': {
    summary: "Campers say it's bright enough to light a whole tent or campsite and lasts several nights on the lower settings. Some keep one at home for power outages too. One common complaint is that the 20-hour battery life only applies to the dimmest mode, and a few call the hanging hook flimsy.",
    aspects: [
      { name: "Brightness", good: 780, bad: 40 },
      { name: "Battery life", good: 640, bad: 170 },
      { name: "USB-C charging", good: 420, bad: 30 },
      { name: "Build quality", good: 310, bad: 120 },
    ],
    reviews: [
      { name: "Doug F.", date: "2025-06-06", stars: 5, title: "Lit up the whole campsite", text: "Used it 3 nights camping at Big Basin. On medium it lit up the whole picnic table area and the battery still had about half left at the end.", verified: false, helpful: 29 },
      { name: "Gary Simmons", date: "2026-08-24", stars: 2, title: "20 hours is only on the lowest setting", text: "On high it lasted about 3 and a half hours. The 20 hours must be on the dimmest mode. Kind of misleading", verified: false, helpful: 38 },
      { name: "Cynthia A.", date: "2026-02-15", stars: 5, title: "Used it in a power outage", text: "Our power was out for 2 days after a storm. This lit the kitchen and living room and I recharged it off a power bank.", verified: true, helpful: 22 },
      { name: "Ben", date: "2026-05-10", stars: 4, title: "Hook is flimsy", text: "The hanging hook on top feels thin. Hasn't broken yet but I'm careful with it.", verified: true, helpful: 8 },
      { name: "Akosua M.", date: "2025-05-29", stars: 5, title: "Glad it's USB-C", text: "Charges off the same cable as my phone. No more buying batteries.", verified: true, helpful: 11 },
      { name: "Pilar G.", date: "2026-04-18", stars: 4, title: "No battery indicator", text: "Wish it showed how much battery is left. It just dies.", verified: false, helpful: 10 },
    ],
    questions: [
      { q: "Can it charge a phone?", a: "No. This lantern does not have an output port, so it cannot charge other devices.", by: "Seller", date: "2026-05-04", votes: 14 },
      { q: "Is it waterproof?", a: "it's been fine in the rain, I wouldn't drop it in a lake", by: "Doug", date: "2025-06-09", votes: 9 },
      { q: "How long does it take to fully charge?", a: "about 4 hours for me", by: "Redbird Customer", date: "2026-08-27", votes: 6 },
    ],
  },

  // ── Books ────────────────────────────────────────────────────────────────
  'book-orchard-at-dusk': {
    summary: "Readers found it moving, with a family that feels real and last chapters that stay with them. Book clubs like the discussion guide in the back. Some think the middle drags, and a few had trouble following the jumps between generations.",
    aspects: [
      { name: "Characters", good: 820, bad: 90 },
      { name: "Story", good: 760, bad: 180 },
      { name: "Writing", good: 690, bad: 110 },
      { name: "Pacing", good: 210, bad: 340 },
    ],
    reviews: [
      { name: "Margaret E.", date: "2026-04-21", stars: 5, title: "Our book club loved it", text: "Picked it for our book club and it was the best discussion we've had all year. The guide in the back helped. Several of us cried at the end.", verified: true, helpful: 58 },
      { name: "Ellie K.", date: "2026-08-03", stars: 5, title: "I called my dad after", text: "I don't usually write reviews. Picked this up because I liked the cover and ended up reading the whole thing on a camping trip over like three days. It's about a family that's had the same orchard for three generations and the youngest daughter has to decide whether to sell it. Not a lot happens, it's mostly small moments and old family arguments nobody ever settled. The grandfather chapters during the drought were my favorite part by far. I called my dad when I finished it.", verified: true, helpful: 64 },
      { name: "Deb L.", date: "2025-05-11", stars: 2, title: "Slow", text: "I wanted to like this. The first 100 pages are great and then nothing happens for a long time. Didn't finish", verified: true, helpful: 31 },
      { name: "Leticia R.", date: "2025-05-15", stars: 5, title: "Felt like my family", text: "My grandparents had a farm in the Central Valley and so much of this felt familiar. The grandmother is my favorite character in a long time.", verified: true, helpful: 27 },
      { name: "Owen T.", date: "2025-07-02", stars: 3, title: "Hard to follow", text: "Jumping between three generations got confusing. I kept flipping back to see who was who. Wish there was a family tree in the front.", verified: true, helpful: 22 },
      { name: "Ravi M.", date: "2025-11-30", stars: 4, title: "Good, not great", text: "Good story and beautiful writing about the orchard itself. The ending felt a bit rushed", verified: true, helpful: 9 },
      { name: "Larry Sage", date: "2025-10-14", stars: 5, title: "Every page", text: "Read it in two nights. Every page was worth it.", verified: true, helpful: 4 },
    ],
    questions: [
      { q: "Is there a large print edition?", a: "Not at this time. This store carries the hardcover only.", by: "Seller", date: "2025-05-06", votes: 11 },
      { q: "Is it ok for a teenager?", a: "some mild language and a sad death but nothing graphic. fine for 15 and up", by: "Margaret", date: "2026-04-26", votes: 8 },
    ],
  },

  'book-small-habits': {
    summary: "It's an easy read, reviewers say, with short chapters and an exercise at the end of each one that helps them actually get started. Readers credit it with small routines like walking or reading more. The main criticism is that the ideas will be familiar to anyone who has read other habit books, and some find the advice too basic.",
    aspects: [
      { name: "Easy to read", good: 1840, bad: 60 },
      { name: "Exercises", good: 1210, bad: 180 },
      { name: "Length", good: 680, bad: 90 },
      { name: "Originality", good: 160, bad: 720 },
    ],
    reviews: [
      { name: "Kendra W.", date: "2024-05-22", stars: 5, title: "Actually did the exercises", text: "I've read a few books like this and never did anything. The exercises are so short I actually did them. I've walked every day for 2 months now.", verified: true, helpful: 47 },
      { name: "P. Kowalski", date: "2026-06-20", stars: 1, title: "Nothing new", text: "Every idea in here I've read before somewhere. Start small, track it, reward yourself. Could've been a blog post", verified: true, helpful: 52 },
      { name: "Linda O.", date: "2026-08-08", stars: 5, title: "Gave copies to my team", text: "I manage a small team and bought a copy for everyone. We did one chapter a week at our Monday meeting.", verified: true, helpful: 16 },
      { name: "Yasmin K.", date: "2024-02-08", stars: 5, title: "Helped after a rough year", text: "I had a really hard year and this helped me get back to small stuff like making my bed and reading 10 pages a night. Its simple but that was kind of what I needed", verified: true, helpful: 24 },
      { name: "Bill Grapes", date: "2025-07-13", stars: 5, title: "Summer reading", text: "Put it on my summer reading list this year. Short and useful.", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Good gift for a new manager?", a: "Yes. I give it to everyone who joins my team. Lean in to the small stuff.", by: "Sheryl Sandbird", date: "2026-04-09", votes: 9 },
      { q: "How long are the chapters?", a: "like 8-10 pages each", by: "Kendra", date: "2024-05-28", votes: 13 },
      { q: "Is it religious at all?", a: "no not at all", by: "Redbird Customer", date: "2026-06-26", votes: 6 },
      { q: "Is there an audiobook version?", a: "This store carries the paperback only. There is no ebook or audiobook edition here.", by: "Seller", date: "2026-05-06", votes: 3 },
    ],
  },

  'book-bay-area-birds': {
    summary: "Birders like the clear drawings, range maps and pocket size. A few wish it had photos or bird calls.",
    aspects: [
      { name: "Illustrations", good: 160, bad: 6 },
      { name: "Size", good: 110, bad: 8 },
      { name: "Maps", good: 90, bad: 5 },
      { name: "Coverage", good: 70, bad: 18 },
    ],
    reviews: [
      { name: "Walter M.", date: "2026-04-19", stars: 5, title: "My new walking companion", text: "I walk the Baylands every morning and this fits in my jacket pocket. Identified 11 new birds my first week. The drawings show the markings clearly.", verified: true, helpful: 34, photo: 0 },
      { name: "Redbird Customer", date: "2026-06-24", stars: 3, title: "Wish it had photos", text: "The drawings are nice but I find photos easier to match to what I'm actually seeing. Also nothing about calls or songs.", verified: true, helpful: 9 },
      { name: "Gina L.", date: "2026-05-11", stars: 5, title: "Gift for my dad", text: "Got this for my dad who just retired and started birding. He takes it everywhere.", verified: true, helpful: 7 },
      { name: "Arturo P.", date: "2026-08-07", stars: 5, title: "Maps are great", text: "The little range map for each bird saves so much time. If it's not shaded for the Bay you probably saw something else", verified: true, helpful: 12 },
      { name: "Hal N.", date: "2025-11-26", stars: 4, title: "Cover bends", text: "Great guide but the flexible cover is getting creased from my pocket. Still holding together.", verified: true, helpful: 5 },
      { name: "S. Ibrahim", date: "2026-03-14", stars: 5, title: "Only the birds you'll actually see", text: "Love that it's only Bay Area birds so I'm not flipping past hundreds of species that never show up here.", verified: true, helpful: 18 },
      { name: "Joan P.", date: "2026-07-01", stars: 5, title: "Good for beginners", text: "It's grouped by type so even a beginner like me can find things. Started in March and I already know the common ones in my yard.", verified: true, helpful: 6 },
      { name: "Evan Seagull", date: "2026-10-08", stars: 5, title: "Seagulls are in it", text: "No seagulls on the cover but there is a whole page on them inside. Five stars.", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Does it include water birds?", a: "yes there's a big section on shorebirds and ducks", by: "Walter", date: "2026-04-28", votes: 8 },
    ],
  },

  // ── Grocery ──────────────────────────────────────────────────────────────
  'grocery-coffee-beans': {
    summary: "It brews smooth and not bitter, and it's good value for an everyday coffee. Plenty of people taste a hint of chocolate, and it works in drip machines, French presses and espresso makers. Some got a stale bag, and a few find the flavor plain.",
    aspects: [
      { name: "Taste", good: 1620, bad: 310 },
      { name: "Value", good: 1180, bad: 120 },
      { name: "Smell", good: 640, bad: 60 },
      { name: "Freshness", good: 210, bad: 290 },
    ],
    reviews: [
      { name: "Elena V.", date: "2025-08-07", stars: 5, title: "Smooth daily coffee", text: "smooth and a little chocolatey, not bitter at all. been on the subscription about 6 months now", verified: false, helpful: 20 },
      { name: "Vince D.", date: "2025-03-14", stars: 1, title: "Stale bag", text: "Roast date on my bag was 4 months ago. Tasted flat and dusty. The second bag was better but still", verified: false, helpful: 26 },
      { name: "Michael O.", date: "2025-07-22", stars: 4, title: "Good in the French press", text: "makes a nice cup in my french press. nothing fancy but its good", verified: true, helpful: 7 },
      { name: "Danielle H.", date: "2026-09-01", stars: 5, title: "Great value", text: "Cheaper than the beans at my local shop and I really can't tell much difference first thing in the morning.", verified: true, helpful: 14 },
      { name: "Paolo R.", date: "2025-05-30", stars: 3, title: "Bit plain", text: "It's fine. Kind of plain. Good for when guests want coffee and I don't want to use the good stuff", verified: true, helpful: 9 },
      { name: "Arnold B.", date: "2025-07-18", stars: 4, title: "Bag doesn't reseal well", text: "Coffee is good but the bag doesn't close back up well. I move it into a jar.", verified: true, helpful: 5 },
      { name: "Sunny L.", date: "2026-06-15", stars: 5, title: "Works for espresso", text: "Ground fine it works for espresso, crema is decent for a medium roast.", verified: false, helpful: 6 },
      { name: "Kat S.", date: "2025-12-05", stars: 5, title: "Smells great", text: "smells amazing when I grind it", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Is there a roast date on the bag?", a: "Yes. Each bag shows a roast date on the back.", by: "Seller", date: "2026-04-20", votes: 13 },
      { q: "Are the beans oily?", a: "no not oily, it's a medium roast so they're pretty dry", by: "Elena", date: "2025-08-10", votes: 5 },
      { q: "Is it decaf?", a: "no this one is regular", by: "Redbird Customer", date: "2026-05-29", votes: 4 },
      { q: "Is it good for cold brew?", a: "yep, grind it coarse. comes out smooth and kind of chocolatey", by: "Mateo", date: "2026-08-09", votes: 5 },
    ],
  },

  'grocery-granola': {
    summary: "Big crunchy clusters and plenty of almonds are the highlights, and most people find it not too sweet. It gets eaten with yogurt, with milk or by the handful. Others think it's too sweet, and a few got a bag that was mostly crumbs.",
    aspects: [
      { name: "Taste", good: 640, bad: 90 },
      { name: "Crunch", good: 520, bad: 40 },
      { name: "Clusters", good: 410, bad: 120 },
      { name: "Sweetness", good: 210, bad: 160 },
    ],
    reviews: [
      { name: "Hailey N.", date: "2026-03-17", stars: 5, title: "Big clusters", text: "big crunchy clusters, its not just loose oats like some brands. great on yogurt", verified: true, helpful: 18 },
      { name: "Carol Y.", date: "2026-08-02", stars: 2, title: "Bag of crumbs", text: "My bag was crushed and it was mostly dust at the bottom. tastes good at least, would be nice if it showed up as actual granola lol", verified: true, helpful: 15 },
      { name: "Javier S.", date: "2026-05-08", stars: 5, title: "Snack at work", text: "I keep a bag at my desk. the zipper actually reseals!! most of them never do", verified: true, helpful: 6 },
      { name: "Molly R.", date: "2026-06-25", stars: 4, title: "A little sweet", text: "Good but a bit sweet for me, so I mix it with plain oats.", verified: true, helpful: 8 },
      { name: "Bernard C.", date: "2026-09-10", stars: 5, title: "Lots of almonds", text: "There are actually a good amount of almonds in it, not just a few slivers", verified: true, helpful: 7 },
      { name: "Nina T.", date: "2026-04-07", stars: 4, title: "Goes fast", text: "16 oz goes fast in our house. Wish they made a bigger bag.", verified: true, helpful: 4 },
      { name: "Ivy", date: "2026-10-13", stars: 5, title: "Kids love it", text: "my kids eat it like candy", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Is it gluten free?", a: "No. It contains oats that are processed in a facility that also handles wheat.", by: "Seller", date: "2026-03-25", votes: 12 },
    ],
  },

  'grocery-olive-oil': {
    summary: "Buyers describe the oil as fresh and a little peppery, use it for cooking and salad dressing, and think the price is good for the size. They like the dark glass bottle. Some bottles broke in shipping, and a few say the spout drips down the side.",
    aspects: [
      { name: "Taste", good: 520, bad: 45 },
      { name: "Value", good: 410, bad: 30 },
      { name: "Packaging", good: 120, bad: 150 },
      { name: "Pour spout", good: 60, bad: 90 },
    ],
    reviews: [
      { name: "Lucia G.", date: "2026-05-04", stars: 5, title: "Peppery and fresh", text: "Has a nice peppery bite at the back of your throat, which my Italian grandmother always said is how you know it's good.", verified: true, helpful: 29 },
      { name: "Redbird Customer", date: "2026-07-28", stars: 1, title: "Arrived broken", text: "Bottle broke in the box and oil soaked everything else in the order. They refunded it but what a mess", verified: true, helpful: 34, photo: 0 },
      { name: "Kurt H.", date: "2026-03-13", stars: 5, title: "Everyday oil", text: "Use it for everything, roasting veggies, eggs, dressing. Good price for a big bottle.", verified: true, helpful: 8 },
      { name: "Bettina M.", date: "2025-10-08", stars: 3, title: "Drips", text: "The oil is good. The spout drips down the side every time so it leaves a ring on my counter.", verified: true, helpful: 12 },
      { name: "Omar F.", date: "2026-06-04", stars: 5, title: "Good for dipping bread", text: "I pour some on a plate with salt and pepper and dip bread in it, could eat that every night", verified: true, helpful: 5 },
      { name: "Clare", date: "2026-04-24", stars: 4, title: "Mild", text: "A little milder than I expected but good", verified: true, helpful: 3 },
      { name: "Renee A.", date: "2026-08-20", stars: 5, title: "Subscribed", text: "I get one a month on subscribe, saves a couple bucks.", verified: true, helpful: 4 },
      { name: "Jesse P.", date: "2026-10-01", stars: 5, title: "Good", text: "Good stuff", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Where are the olives from?", a: "Our olives are grown and pressed in the Mediterranean region. The country is printed on the back label.", by: "Seller", date: "2026-04-03", votes: 9 },
      { q: "Is there a harvest date?", a: "yes on the back label near the bottom", by: "Lucia", date: "2026-05-09", votes: 6 },
    ],
  },

  'grocery-sparkling-water': {
    summary: "Opinions on the lime flavor differ. Fans find it light and refreshing and drink it to cut back on soda, while others say it's too faint. The cans are very fizzy right after opening, but some say it goes flat quickly, and a few arrived dented or leaking.",
    aspects: [
      { name: "Flavor", good: 1420, bad: 620 },
      { name: "Fizziness", good: 1210, bad: 240 },
      { name: "Value", good: 980, bad: 70 },
      { name: "Packaging", good: 90, bad: 280 },
    ],
    reviews: [
      { name: "Gabriela T.", date: "2025-05-25", stars: 5, title: "Helped me quit soda", text: "I used to drink 3 sodas a day. Switched to this and haven't had one in a month. Lime is just enough flavor.", verified: true, helpful: 33 },
      { name: "Tom H.", date: "2026-07-20", stars: 2, title: "Barely tastes like lime", text: "Tastes like plain sparkling water with a lime somewhere in the next room", verified: true, helpful: 48 },
      { name: "Kiara J.", date: "2025-06-08", stars: 5, title: "Very fizzy", text: "Very bubbly when you first open it. Cold out of the fridge it's great.", verified: true, helpful: 7 },
      { name: "Derrick L.", date: "2025-08-03", stars: 4, title: "Wish it came in bigger packs", text: "We go through 12 cans in 3 days. Subscribe and save helps", verified: true, helpful: 4 },
      { name: "Bill Grapes", date: "2024-10-09", stars: 4, title: "Needs grape", text: "Love the lime. Please make a grape one.", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Is it sweetened with anything?", a: "no sweetener at all, just lime flavor", by: "Gabriela", date: "2025-06-01", votes: 12 },
      { q: "Does it have sodium?", a: "No. There is no sodium in this sparkling water.", by: "Seller", date: "2026-04-22", votes: 8 },
    ],
  },

  // ── Toys & games ─────────────────────────────────────────────────────────
  'cobble-blocks-set': {
    summary: "Parents say the blocks are sturdy and brightly colored, and kids keep coming back to them. The paint has held up to chewing and throwing. A few blocks had rough edges or chipped paint, and the set comes in a bag with no storage box.",
    aspects: [
      { name: "Quality", good: 640, bad: 40 },
      { name: "Play value", good: 590, bad: 20 },
      { name: "Paint", good: 410, bad: 70 },
      { name: "Storage", good: 30, bad: 150 },
    ],
    reviews: [
      { name: "Erica S.", date: "2026-03-06", stars: 5, title: "Played with them for hours", text: "My 3 year old built towers for 2 hours straight the first day. bright colors and nice thick wood", verified: true, helpful: 37, photo: 0 },
      { name: "Tara N.", date: "2026-05-18", stars: 2, title: "Rough edges and chipped paint", text: "A few blocks had rough edges I had to sand down, and the paint chipped on 3 of them in the first week. Not great for a toddler toy.", verified: true, helpful: 26, photo: 1 },
      { name: "Shanice B.", date: "2026-04-10", stars: 4, title: "No storage box", text: "Great blocks but they come in a plastic bag. Had to buy a bin for them", verified: true, helpful: 14 },
      { name: "Paul K.", date: "2026-08-26", stars: 5, title: "Survived my twins", text: "Two 4 year olds throwing them at each other and they're still in one piece. The blocks and the twins.", verified: true, helpful: 18 },
      { name: "Rocío V.", date: "2026-09-29", stars: 5, title: "Preschool teacher here", text: "Bought 2 sets for my preschool classroom. Holding up with 15 kids using them every day.", verified: true, helpful: 11 },
    ],
    questions: [
      { q: "Is the paint safe if my kid chews on them?", a: "Yes. The blocks are finished with water-based, non-toxic paint that is safe for children.", by: "Seller", date: "2026-03-15", votes: 23 },
      { q: "How big are the blocks?", a: "the basic square is about 1 inch on each side", by: "Erica", date: "2026-03-20", votes: 7 },
      { q: "Do they come with a box?", a: "no, plastic bag", by: "Redbird Customer", date: "2026-04-13", votes: 9 },
      { q: "What age is this set for?", a: "The set is made for ages 3 and up.", by: "Seller", date: "2026-05-02", votes: 2 },
    ],
  },

  'cobble-puzzle': {
    summary: "The pieces are sturdy and big enough for small hands, and kids learn country names as they play, which makes it a popular gift. Some don't like that small countries are grouped together on one piece. A few found it too easy for kids older than 7.",
    aspects: [
      { name: "Learning", good: 280, bad: 20 },
      { name: "Quality", good: 260, bad: 25 },
      { name: "Difficulty", good: 120, bad: 80 },
      { name: "Accuracy", good: 60, bad: 50 },
    ],
    reviews: [
      { name: "Kristina O.", date: "2026-05-03", stars: 5, title: "My daughter knows the continents now", text: "My 5 year old does this every weekend and now she points out countries on the news. Pieces are thick and easy to pick up.", verified: false, helpful: 22 },
      { name: "Redbird Customer", date: "2026-07-08", stars: 3, title: "Too easy for older kids", text: "My 8 year old finished it in 10 minutes and was done with it. Better for 5 and 6", verified: false, helpful: 13 },
      { name: "Vikram S.", date: "2025-10-16", stars: 4, title: "Small countries are grouped", text: "Not every country is its own piece, the small ones are grouped together on bigger pieces. Makes sense for 48 pieces, just know that going in.", verified: false, helpful: 15 },
      { name: "Maureen D.", date: "2026-03-19", stars: 5, title: "Birthday gift", text: "Gave it to my nephew for his 6th birthday and his mom says he does it every day.", verified: false, helpful: 5 },
      { name: "Luca B.", date: "2026-06-27", stars: 5, title: "Nice wood", text: "Sturdy wood and bright colors. names are easy to read too", verified: false, helpful: 4 },
      { name: "Teresa F.", date: "2026-09-23", stars: 4, title: "Printing slightly off", text: "The country names on a couple of pieces are a little off center. Kids don't notice", verified: false, helpful: 3 },
      { name: "Abel M.", date: "2026-04-29", stars: 5, title: "Homeschool", text: "We use it in our homeschool geography lessons. Holds up well.", verified: false, helpful: 6 },
    ],
    questions: [
      { q: "Are the country names printed on the pieces?", a: "Yes. The country names are printed on the pieces.", by: "Seller", date: "2026-04-01", votes: 7 },
      { q: "Is there a board or tray?", a: "yes there's a wooden tray with the outline of the map", by: "Kristina", date: "2026-05-10", votes: 6 },
    ],
  },

  // ── More chargers ─────────────────────────────────────────────────────────
  'kestrel-20w-nano': {
    summary: "For a lot of owners this is the smallest 20-watt charger they've had, and it still charges phones quickly. The folding plug and the Slate gray color get compliments. It costs a few dollars more than other 20-watt chargers, though, and it gets warm and charges slowly with a tablet.",
    aspects: [
      { name: "Size", good: 1210, bad: 25 },
      { name: "Charging speed", good: 880, bad: 60 },
      { name: "Folding plug", good: 540, bad: 14 },
      { name: "Price", good: 160, bad: 240 },
      { name: "Heat", good: 70, bad: 110 },
    ],
    reviews: [
      { name: "Adrienne P.", date: "2025-06-12", stars: 5, title: "Tiny and it actually works", text: "Bought this for a two week trip through Portugal and Spain and used it with a plug adapter. It's so small it fits in the coin pocket of my jeans lol. Charged my iPhone 15 every night and my partner's Pixel in the mornings. With the adapter on it sticks out from the wall a bit but it never fell out. Prongs fold flat so nothing in my toiletry bag got scratched up. Had it about 4 months now and it's the only charger I use, gave my old big one away", verified: true, helpful: 96, variant: "Color: Slate gray" },
      { name: "Bilal K.", date: "2025-07-03", stars: 4, title: "Costs more than it should", text: "Works great and it's really small. But it's a few dollars more than the other 20W chargers on here, and with tax it came to over 25. You're paying for the size I guess.", verified: true, helpful: 31, variant: "Color: White" },
      { name: "cmorales", date: "2025-06-19", stars: 5, title: "smaller than my airpods case", text: "smaller than my airpods case lol. charges my iphone 16 fast", verified: true, helpful: 8, variant: "Color: White" },
      { name: "Dolores T.", date: "2025-08-22", stars: 5, title: "Easy to find in my purse", text: "I keep it in my purse with a short cable. The gray is easy to spot at the bottom of the bag, the white chargers always disappear on me.", verified: true, helpful: 6, variant: "Color: Slate gray" },
      { name: "Eamon K.", date: "2026-03-08", stars: 3, title: "Gets warm with my iPad", text: "Phone charging is quick and it stays cool. With my iPad Air it got pretty warm and the iPad said almost 3 hours to full. I know 20W is just slow for a tablet, that's on me. If you want it for an iPad get something bigger", verified: true, helpful: 22, variant: "Color: White" },
      { name: "Avery L.", date: "2026-05-27", stars: 5, title: "My second Hanker", text: "I have the Hanker 65W in my laptop bag and wanted a tiny one for the house. Feels the same and has the same matte finish. My Galaxy S23 shows the fast charging message with it.", verified: true, helpful: 11, variant: "Color: Slate gray" },
    ],
    questions: [
      { q: "Does it come in black?", a: "Not at the moment. It comes in White and Slate gray.", by: "Seller", date: "2026-05-02", votes: 9 },
      { q: "Will it fast charge an iPhone 16 Pro?", a: "yes, I get about 50% in half an hour on my 16 Pro with a usb-c cable", by: "Adrienne", date: "2025-06-20", votes: 14 },
    ],
  },

  'voltedge-45w-gan': {
    summary: "Customers say it charges fast once it finally arrives, and they like having a USB-C and a USB-A port on one plug. Shipping from overseas usually takes three to four weeks, which is the main complaint. Others mention that the prongs don't fold and that it feels lighter and cheaper than expected.",
    aspects: [
      { name: "Shipping time", good: 30, bad: 210 },
      { name: "Charging speed", good: 190, bad: 25 },
      { name: "Two ports", good: 150, bad: 18 },
      { name: "Build quality", good: 60, bad: 70 },
    ],
    reviews: [
      { name: "Cass T.", date: "2026-05-15", stars: 2, title: "Almost a month to get here", text: "needed a charger for a work trip and this said 45W for like 22 bucks so I grabbed it without reading the shipping part. it ships from overseas. took 24 days!! I was already back from the trip when it showed up. charger itself is fine, my Galaxy S24 Ultra says super fast charging and I use the USB-A port for my watch. but I had to buy another one at the airport anyway so this basically cost me double. check the delivery date", verified: true, helpful: 58 },
      { name: "Dante R.", date: "2026-07-09", stars: 5, title: "Super fast charging on my Ultra", text: "My S24 Ultra says Super fast charging 2.0 with this, my old 25W block never did that. and I can charge my earbuds off the USB-A port at the same time", verified: false, helpful: 12 },
      { name: "Edith L.", date: "2026-03-24", stars: 4, title: "Good value if you can wait", text: "Took 19 days, which is about what it said. For 45W with two ports at this price I'm happy. Prongs don't fold though.", verified: true, helpful: 9 },
      { name: "akira.w", date: "2026-08-30", stars: 4, title: "charges my ipad and phone together", text: "ipad pro and iphone at the same time overnight, both full in the morning. shipping was 3 weeks", verified: true, helpful: 3 },
      { name: "Bruno A.", date: "2026-06-21", stars: 1, title: "Tracking stuck for 2 weeks", text: "Tracking said in transit with no updates for 15 days. Contacted support twice. It finally came on day 26. Not ordering overseas stuff again when I actually need it.", verified: true, helpful: 27 },
      { name: "Chandra P.", date: "2026-04-11", stars: 5, title: "Charges my work laptop", text: "Charges my small work laptop at a normal speed. Way smaller than the brick it came with.", verified: true, helpful: 5 },
      { name: "Eva T.", date: "2026-10-02", stars: 5, title: "good", text: "good charger, came in about 3 weeks like it said", verified: true, helpful: 1 },
    ],
    questions: [
      { q: "How much power does each port get when both are used?", a: "With both ports in use, the USB-C port gives up to 25 W and the USB-A port up to 18 W. One port on its own gives up to 45 W.", by: "Seller", date: "2026-03-30", votes: 11 },
    ],
  },

  'sparrowline-20w-usbc': {
    summary: "This is an inexpensive 20-watt charger that charges phones at full speed, and people like using the three colors to tell chargers apart. Free delivery is slow, and fast shipping costs about half what the charger does. A few wish the prongs folded.",
    aspects: [
      { name: "Price", good: 420, bad: 30 },
      { name: "Colors", good: 310, bad: 12 },
      { name: "Charging speed", good: 360, bad: 55 },
      { name: "Shipping cost", good: 25, bad: 140 },
      { name: "Fixed plug", good: 20, bad: 95 },
    ],
    reviews: [
      { name: "Delphine M.", date: "2026-09-03", stars: 3, title: "Cheap charger, not cheap shipping", text: "Charger was 15.99 which looked like the best deal on the site. Then free shipping said over a week and 2 day was another 7.99, so with tax I'd have paid more than for some of the pricier ones. So I waited the week. Works fine, charges my iPhone 14 quick. Just look at the delivery date before you get excited about the price", verified: true, helpful: 44, variant: "Color: Black" },
      { name: "Fabian R.", date: "2026-05-06", stars: 5, title: "One color per kid", text: "Got all three colors so my kids stop fighting over whose charger is whose. Everyone has their own color now. All three charge their phones fine.", verified: false, helpful: 18, variant: "Color: Sky blue" },
      { name: "beckyinboise", date: "2026-07-28", stars: 5, title: "cute blue", text: "the sky blue is really cute and it charges my pixel 8 fast", verified: true, helpful: 5, variant: "Color: Sky blue" },
      { name: "Cole H.", date: "2026-03-15", stars: 4, title: "Works, plug doesn't fold", text: "Charges my Galaxy A54 fast. I only wish the prongs folded, they poke stuff in my backpack.", verified: false, helpful: 13, variant: "Color: White" },
      { name: "Amit S.", date: "2026-08-19", stars: 5, title: "Paid for 2 day shipping", text: "Needed it before a trip so I paid the 7.99 for 2 day delivery. It came on time and it works fine.", verified: true, helpful: 6, variant: "Color: White" },
      { name: "Ezra M.", date: "2026-06-02", stars: 2, title: "Stopped fast charging", text: "first month it fast charged my iPhone no problem. now it only charges slow, and its the same cable that fast charges on my other charger so it's not the cable. messaged the seller", verified: true, helpful: 21, variant: "Color: Black" },
    ],
    questions: [
      { q: "Why does delivery take a week?", a: "Free standard delivery for this charger takes 5 to 8 business days. Delivery in 2 business days is available at checkout for $7.99.", by: "Seller", date: "2026-06-09", votes: 15 },
      { q: "Does it come with a cable?", a: "No, just the charger.", by: "Redbird Customer", date: "2026-08-01", votes: 8 },
    ],
  },

  'chargemate-20w-usbc-cord': {
    summary: "The attached cable reaches from the wall to a bed or couch and charges newer iPhones and Android phones quickly, and buyers like having no separate cable to lose. Delivery took more than a week for some. A few had the cable wear out near the plug, which means replacing the whole charger.",
    aspects: [
      { name: "Cable length", good: 520, bad: 20 },
      { name: "Built-in cable", good: 300, bad: 40 },
      { name: "Shipping time", good: 30, bad: 180 },
      { name: "Durability", good: 140, bad: 110 },
    ],
    reviews: [
      { name: "Dwayne B.", date: "2026-06-28", stars: 5, title: "Finally a USB-C ChargeMate", text: "Had the Lightning ChargeMate by my bed for years and loved the long cord. Then I got an iPhone 16 and it didn't fit anymore, so I was glad to see they made a USB-C one. Same thing, same 6 foot cord, still reaches my recliner and it fits my phone now. My wife uses it for her Galaxy too. Shipping took 8 business days though which is a lot longer than most stuff I order on here.", verified: true, helpful: 63 },
      { name: "Eileen W.", date: "2026-04-07", stars: 2, title: "Took 9 days", text: "Ordered on a Monday and it came Thursday of the following week. I didn't see how long it would take until checkout. Works fine but I had to borrow a charger all week.", verified: true, helpful: 29 },
      { name: "Ari W.", date: "2026-08-13", stars: 5, title: "Reaches the couch", text: "Long cord reaches from the outlet to the couch with room to spare. Charges my Pixel 9 quickly.", verified: true, helpful: 7 },
      { name: "Bree C.", date: "2025-10-26", stars: 4, title: "Cord is thick", text: "cord is thick and feels strong, bit stiff tho. works great with my iPhone 15", verified: true, helpful: 4 },
      { name: "Cedric O.", date: "2026-07-01", stars: 3, title: "Fraying after 4 months", text: "The cord started to split right at the USB-C end after about 4 months of being pulled over to my bed every night. Since it's attached you can't just swap the cable. Still works for now.", verified: true, helpful: 24 },
      { name: "Damon F.", date: "2026-03-12", stars: 5, title: "Good for my mom", text: "Bought it for my mom so she stops losing cables. She loves it.", verified: true, helpful: 3 },
      { name: "Felipe G.", date: "2025-11-09", stars: 4, title: "Check which plug it is", text: "Heads up this one is USB-C and the other ChargeMate is Lightning, they look almost the same in the pictures. I got the right one for my iPhone 16 luckily. works great", verified: true, helpful: 15 },
    ],
    questions: [
      { q: "Will this fit an iPhone 14?", a: "No. iPhone 14 and older use Lightning. This charger's cable ends in a USB-C plug, which fits iPhone 15 and newer.", by: "Seller", date: "2026-04-15", votes: 33 },
      { q: "Is there a faster shipping option?", a: "there wasn't when I ordered, mine took 8 business days", by: "Dwayne", date: "2026-07-03", votes: 12 },
      { q: "Can I plug another cable into the block?", a: "no, there's no port on it. the cord is part of the charger", by: "Redbird Customer", date: "2026-08-22", votes: 6 },
    ],
  },

  'rb-30w-usbc-charger': {
    summary: "Reviewers say it's small but strong enough for an iPad or a small laptop, charges phones quickly, and has a handy folding plug. Free delivery took about a week for some. It can get warm and slow down when it's powering a laptop that's in use.",
    aspects: [
      { name: "Charging speed", good: 1020, bad: 60 },
      { name: "Tablet charging", good: 610, bad: 40 },
      { name: "Folding plug", good: 480, bad: 12 },
      { name: "Delivery time", good: 40, bad: 260 },
      { name: "Heat", good: 50, bad: 90 },
    ],
    reviews: [
      { name: "Eduardo S.", date: "2025-07-20", stars: 5, title: "Charges my iPad Pro properly", text: "My iPad Pro didn't come with a charger and the old 12W one in my drawer took forever. This one gets it from around 20% to full in a little under 2 hours. Tried it on my MacBook Air too and it works, slower than the brick that came with the laptop but fine overnight. It's barely bigger than the Redbird 20W I use for my phone and the prongs fold. 20 bucks, really happy with it", verified: true, helpful: 74 },
      { name: "Anneliese K.", date: "2026-05-11", stars: 4, title: "Wish free shipping was quicker", text: "Great charger, but free delivery said about a week, and the faster option was 4.99 and still 3 days. I waited the week.", verified: true, helpful: 19 },
      { name: "chuckmakesstuff", date: "2025-04-02", stars: 5, title: "half charged in 25 min", text: "iphone 16 pro max from 5% to 52% in 25 min. pretty much what it says", verified: true, helpful: 12 },
      { name: "Cleo B.", date: "2025-09-08", stars: 3, title: "Warm with my laptop", text: "gets pretty warm with my laptop and the laptop barely charges while I'm using it. for phones and the iPad it's great. if a laptop is the main thing you want it for get a bigger one", verified: true, helpful: 16 },
      { name: "Byron H.", date: "2025-07-15", stars: 5, title: "Replaced two chargers", text: "Replaced the phone charger and the tablet charger on my desk with just this. one plug for both, I just move the cable over", verified: true, helpful: 5 },
      { name: "Elisa P.", date: "2025-09-24", stars: 5, title: "Stays in loose hotel outlets", text: "Stayed put in a hotel outlet that kept dropping my other charger every night.", verified: true, helpful: 3 },
      { name: "Freya N.", date: "2025-10-13", stars: 4, title: "No cable", text: "Works great, but remember there's no cable in the box.", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Will this charge a MacBook Air?", a: "Yes. A 30 W charger can charge a MacBook Air. It charges more slowly than a higher-wattage laptop charger, especially while the laptop is in use.", by: "Seller", date: "2026-04-05", votes: 26 },
      { q: "Is it bigger than the Redbird 20W?", a: "a tiny bit taller, basically the same size", by: "Eduardo", date: "2025-07-26", votes: 10 },
      { q: "Does the plug fold?", a: "yes", by: "Redbird Customer", date: "2026-06-03", votes: 4 },
    ],
  },

  'rb-12w-usba-2pack': {
    summary: "Cheap spares for old USB-A cables, though USB-C to USB-C cables won't fit and newer phones charge slowly on them.",
    aspects: [
      { name: "Value", good: 1620, bad: 80 },
      { name: "Size", good: 740, bad: 20 },
      { name: "Charging speed", good: 320, bad: 410 },
      { name: "Port type", good: 280, bad: 360 },
    ],
    reviews: [
      { name: "Bethany R.", date: "2026-04-18", stars: 2, title: "My USB-C cable doesn't fit", text: "Bought these for my iPhone 16, and the cable that came with the phone is USB-C on both ends. It doesn't go in. These only take the old rectangle plug. My fault for not reading, but the title just says USB wall charger. Returning.", verified: true, helpful: 88 },
      { name: "Augusta B.", date: "2025-06-06", stars: 5, title: "Great spares", text: "I have a whole drawer of old USB-A cables from years of phones and e-readers and earbuds so these were perfect. One went in the guest room, one by the back door for the bluetooth speaker, and my mother in law took one home lol. They're small and don't block the other outlet. For charging overnight who cares about the speed. Ten dollars for two", verified: true, helpful: 41 },
      { name: "Edgar M.", date: "2025-08-27", stars: 3, title: "Slow for a new phone", text: "Works but it took about 3 hours to charge my Galaxy S24. ok overnight I guess", verified: true, helpful: 23 },
      { name: "bbq_dad_tx", date: "2025-03-21", stars: 5, title: "cheap and they work", text: "cheap and they work. one in the truck bag one in the garage", verified: true, helpful: 4 },
      { name: "Consuelo V.", date: "2026-07-17", stars: 5, title: "For my Kindle", text: "Charges my Kindle and my earbuds overnight. That's all I need.", verified: true, helpful: 6 },
      { name: "Dom C.", date: "2026-05-02", stars: 4, title: "Cheap", text: "Cheap and it works. Wish it was USB-C though, my new phone needs a different cable.", verified: true, helpful: 1 },
      { name: "Francesca L.", date: "2026-10-04", stars: 4, title: "You need a USB-A cable", text: "works fine with my older iPhone and a Lightning cable with the USB-A end. but if your phone came with one of the cables that's USB-C on both ends it won't fit, you'd need a different cable or a different charger", verified: true, helpful: 17 },
    ],
    questions: [
      { q: "Will this fast charge my iPhone 15?", a: "No. These chargers give up to 12 W from a USB-A port, which is standard speed. To fast charge an iPhone 15, use a USB-C charger with 20 W or more.", by: "Seller", date: "2024-05-18", votes: 37 },
      { q: "Does a USB-C cable fit?", a: "only if the other end is USB-A. a cable with USB-C on both ends won't fit", by: "Bethany", date: "2026-04-25", votes: 29 },
      { q: "Are both chargers the same?", a: "yes, two identical ones", by: "Redbird Customer", date: "2026-07-09", votes: 3 },
    ],
  },

  'sparrowline-3in1-station': {
    summary: "One plug charges a phone, a watch and earbuds, which clears up the nightstand, and the magnet holds the phone firmly. Buyers are glad the wall plug comes in the box. Thick or non-magnetic cases stop the phone from staying on, and the watch charges slowly for a few people. It's made for iPhones with magnets, so most Android phones won't stay on it.",
    aspects: [
      { name: "Charging three devices", good: 980, bad: 45 },
      { name: "Magnet strength", good: 620, bad: 110 },
      { name: "Tidy nightstand", good: 540, bad: 10 },
      { name: "Watch charging", good: 230, bad: 160 },
      { name: "Price", good: 150, bad: 120 },
    ],
    reviews: [
      { name: "Chet L.", date: "2025-06-25", stars: 5, title: "Three chargers down to one", text: "Replaced a tangle of three chargers on my nightstand with this. Phone snaps on with the magnet and I can see the time on it at night, watch and AirPods go on the bottom. The wall plug was in the box too so I didn't have to go hunting for a charger strong enough. Folds flat, I took it on a long weekend trip. There's a little light on the base, it's pretty dim but my wife still wanted it darker so now it faces the wall", verified: true, helpful: 81, variant: "Color: White" },
      { name: "Agnes H.", date: "2026-04-03", stars: 3, title: "Won't hold my wallet case", text: "with my thick wallet case on the phone slides right off the stand and doesn't charge. case off it's fine. wish I'd known that before I bought it", verified: true, helpful: 34, variant: "Color: Black" },
      { name: "Ernesto R.", date: "2025-08-15", stars: 5, title: "Watch, phone, earbuds", text: "Watch, phone and earbuds all full in the morning. Looks nice in black.", verified: true, helpful: 8, variant: "Color: Black" },
      { name: "Amelia F.", date: "2025-07-18", stars: 4, title: "Watch charger is slow", text: "phone charges fast but my watch takes way longer than on its own charger. it's overnight so doesn't really matter", verified: true, helpful: 12, variant: "Color: White" },
      { name: "Blake N.", date: "2025-08-08", stars: 2, title: "Doesn't work with my Galaxy", text: "I have a Galaxy S24 and the phone won't stay on the stand at all. The details say magnetic iPhones, which I didn't read. My fault, but returning.", verified: true, helpful: 27, variant: "Color: Black" },
      { name: "Devin P.", date: "2026-05-14", stars: 5, title: "Pricey but it replaced three", text: "Expensive compared to a regular charger, but it replaced three of them.", verified: true, helpful: 5, variant: "Color: White" },
    ],
    questions: [
      { q: "Does it work with a Samsung phone?", a: "The phone pad is magnetic and made for iPhone 12 and newer. Phones without magnets, like most Galaxy phones, will not stay in place unless you add a magnetic case or ring.", by: "Seller", date: "2026-04-10", votes: 22 },
      { q: "Is the wall plug included?", a: "yes, the wall plug and the cable were both in the box", by: "Chet", date: "2025-06-30", votes: 18 },
      { q: "Will it work on Mars?", a: "Not tested yet. Works fine on Earth.", by: "Elon Tusk", date: "2025-06-01", votes: 5 },
    ],
  },

  'kestrel-48w-car-charger': {
    summary: "It sits almost flush with the dashboard and charges two phones quickly, which road-trippers like. It can be hard to pull out without the ring, and a few found it loose in their car's socket. A few others bought it by mistake, thinking it plugs into a wall.",
    aspects: [
      { name: "Charging speed", good: 760, bad: 40 },
      { name: "Two ports", good: 590, bad: 15 },
      { name: "Fit in socket", good: 410, bad: 75 },
      { name: "Size", good: 380, bad: 60 },
    ],
    reviews: [
      { name: "Barrett J.", date: "2026-08-16", stars: 5, title: "Ended the road trip fights", text: "We do a lot of road trips with two teenagers and they fought over the one car charger the entire time. Now one gets the USB-C port and one gets the USB-A. My daughter's iPhone 15 fast charges and my son's older Android on the A port charges fine. It sits almost flat in the socket, at night all you see is the little blue ring. There's a pull ring to get it out", verified: false, helpful: 52 },
      { name: "Dalia S.", date: "2026-05-29", stars: 1, title: "This is for a CAR", text: "I thought this was a wall charger. It's for the cigarette lighter socket in a car and doesn't fit a wall outlet at all. Read the description.", verified: false, helpful: 46 },
      { name: "Emeka O.", date: "2026-03-18", stars: 5, title: "Fast in the car", text: "My phone goes from 15 to 60 percent on my 30 minute commute.", verified: false, helpful: 9 },
      { name: "cyclist_ana", date: "2026-07-07", stars: 4, title: "hard to pull out", text: "sits so deep I need the little ring to get it out. works great though", verified: true, helpful: 6 },
      { name: "Benji T.", date: "2025-11-30", stars: 5, title: "Works in both our cars", text: "Works in my old pickup and in my wife's minivan.", verified: false, helpful: 3 },
      { name: "Cora N.", date: "2026-06-24", stars: 3, title: "Loose in my socket", text: "In my car's socket it's a little loose and cuts out over bumps. In my husband's car it's tight. Must depend on the car.", verified: true, helpful: 14 },
    ],
    questions: [
      { q: "Can I use this in a wall outlet?", a: "No. This charger plugs into a car's 12 V or 24 V socket (the cigarette lighter). For a wall outlet you need a wall charger.", by: "Seller", date: "2026-06-02", votes: 31 },
      { q: "Does it come with cables?", a: "no cables, just the charger", by: "Barrett", date: "2026-08-20", votes: 9 },
    ],
  },

  'pebble-15w-wireless-pad': {
    summary: "Being able to just set the phone down is the appeal, and it charges through most thin cases. Galaxy and Pixel phones charge faster on it than iPhones do. Some were surprised there's no wall plug in the box, and the phone stops charging if it isn't centered on the pad.",
    aspects: [
      { name: "Ease of use", good: 1340, bad: 50 },
      { name: "Charging speed", good: 480, bad: 420 },
      { name: "Phone placement", good: 300, bad: 260 },
      { name: "Wall plug not included", good: 20, bad: 390 },
      { name: "Indicator light", good: 90, bad: 120 },
    ],
    reviews: [
      { name: "Asha V.", date: "2026-05-09", stars: 2, title: "No wall plug in the box", text: "Comes with a USB-C cable and nothing to plug it into. All I had was old USB-A chargers so I couldn't even use it until I bought a USB-C one. Should of read the box I guess. Pad itself is fine", verified: true, helpful: 67, variant: "Color: Black" },
      { name: "Cyrus A.", date: "2025-07-03", stars: 5, title: "No more fumbling for the cable", text: "Got it for my nightstand because I was always fumbling for the cable in the dark. Now I just set the phone down. It's plugged into a 20W charger I already had and my Pixel 8 charges overnight no problem, through my thin case too. light is soft and turns off after a bit. if you put the phone down off center it won't charge, took me a few nights to learn where the middle is", verified: true, helpful: 39, variant: "Color: White" },
      { name: "Bo Stanton", date: "2025-05-30", stars: 3, title: "Slow with iPhone", text: "With my iPhone 15 it's slow, 7.5 watts like the fine print says. Overnight it's fine, during the day I use a cable.", verified: true, helpful: 21, variant: "Color: Black" },
      { name: "Deepa K.", date: "2026-08-21", stars: 5, title: "Galaxy charges fast", text: "My Galaxy S23 says fast wireless charging on it. The pad is nice and flat.", verified: true, helpful: 7, variant: "Color: Black" },
      { name: "Cal W.", date: "2025-08-28", stars: 5, title: "Desk charger", text: "Keep it on my desk at work, my phone is always charged.", verified: true, helpful: 2, variant: "Color: White" },
      { name: "Aylin T.", date: "2026-10-14", stars: 4, title: "Phone gets warm", text: "Phone gets a little warm on it, not bad. Charges fine.", verified: true, helpful: 3, variant: "Color: White" },
    ],
    questions: [
      { q: "Does it come with a wall adapter?", a: "No. The pad comes with a USB-C cable only. Plug the cable into a USB-C wall charger, 20 W or more for the fastest speed.", by: "Seller", date: "2026-04-02", votes: 41 },
      { q: "Will it work with an iPhone 13?", a: "yes, mine charges, just slower than with a cable", by: "Bo", date: "2025-06-08", votes: 8 },
      { q: "can i use it with my old USB-A charger?", a: "not with the cable it comes with, that one is USB-C on both ends", by: "Redbird Customer", date: "2026-07-24", votes: 6 },
    ],
  },

  // ── More cables, cases and audio ──────────────────────────────────────────
  'rb-usbc-lightning-cable-3ft': {
    summary: "iPhone owners say it charges older models quickly from a USB-C charger and never shows the \"accessory not supported\" warning that cheap cables do. It's a common replacement for a frayed original cable. It doesn't fit iPhone 15 or 16, which caught some buyers out, and some find 3 feet too short to reach a bed.",
    aspects: [
      { name: "Charging speed", good: 2900, bad: 140 },
      { name: "Compatibility", good: 1500, bad: 360 },
      { name: "Durability", good: 2300, bad: 380 },
      { name: "Length", good: 1100, bad: 420 },
      { name: "Value", good: 1900, bad: 60 },
    ],
    reviews: [
      { name: "Gail Thornton", date: "2025-06-14", stars: 5, title: "Needed a new charger too, but worth it", text: "The cable that came with my iPhone 13 finally split open by the plug so I ordered this one. When it came it would not go into the old white cube charger I've had forever. Turns out this end is USB-C and my cube has the big rectangle hole. So I ordered the Redbird Basics 20W charger to go with it and now my phone charges so much faster than it ever did!! You do need a USB-C charger for this, I didn't know that. The cable feels nice and the plug clicks in good.", verified: true, helpful: 54 },
      { name: "Hollis M.", date: "2025-04-21", stars: 1, title: "Does not fit iPhone 16", text: "Bought this for my new iPhone 16 because the title says iPhone charger cable. The iPhone 16 is USB-C, the Lightning plug doesn't go in at all. My mistake I guess but I think a lot of people will make the same one.", verified: true, helpful: 88 },
      { name: "jmarsh", date: "2025-09-08", stars: 5, title: "no warning popup", text: "no \"accessory not supported\" message like the gas station ones gave me. iphone 11, charges fast", verified: true, helpful: 12 },
      { name: "Inez Carrillo", date: "2025-08-02", stars: 4, title: "Wish it was longer", text: "Charges my iPhone 14 fast with my USB-C charger but 3 feet doesn't reach from the outlet to my bed. Moved it to my desk, it's perfect there", verified: true, helpful: 9 },
      { name: "Leon B.", date: "2025-07-19", stars: 5, title: "Much faster than my old cable", text: "With a 20W charger my iPhone 12 went from 15% to about 60% in half an hour. My old USB-A cable would have been at maybe 30%.", verified: true, helpful: 17 },
      { name: "Kofi A.", date: "2025-10-12", stars: 2, title: "Started cutting out after 4 months", text: "Worked fine at first, then it started only charging if I held the Lightning end at an angle. Redbird sent a replacement quickly so I'll see if the new one lasts longer.", verified: true, helpful: 23 },
      { name: "Harriet W.", date: "2024-06-09", stars: 5, title: "Works on my iPad", text: "Also works with my iPad 9th gen, which still has the Lightning port.", verified: true, helpful: 3 },
      { name: "Tim Cookie", date: "2026-10-03", stars: 5, title: "Courageous", text: "Love that they still make these. Very courageous.", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Will this work with iPhone 15 Pro?", a: "No. iPhone 15 and newer use USB-C. This cable has a Lightning plug, which fits iPhone 14 and older.", by: "Seller", date: "2026-03-28", votes: 61 },
      { q: "Can I plug it into my old square iPhone charger?", a: "not the old one with the big rectangle port, you need a usb-c charger. i had to buy one", by: "Gail", date: "2025-06-20", votes: 19 },
    ],
  },

  'sparrowline-usba-usbc-2pack': {
    summary: "Six feet is a handy length in the car or on the couch, and the braid holds up well for two cables at this price. People mostly use them with car USB ports and older chargers. The USB-A end won't fit newer USB-C-only chargers, which disappointed some, and a few say charging is slower than with a USB-C to USB-C cable.",
    aspects: [
      { name: "Length", good: 2100, bad: 160 },
      { name: "Durability", good: 1650, bad: 230 },
      { name: "Value", good: 1880, bad: 40 },
      { name: "Charging speed", good: 760, bad: 410 },
      { name: "Fit with chargers", good: 240, bad: 380 },
    ],
    reviews: [
      { name: "Lamar J.", date: "2024-03-23", stars: 5, title: "One in the truck, one at my desk", text: "My truck only has the old USB-A ports so I needed cables with that end. One stays in the truck, 6 feet reaches the back seat so the kids can use their tablets while they charge. Other one is at my desk at work. The braid has been stepped on and shut in the truck door a few times and it's still fine.", verified: false, helpful: 47, variant: "Color: Gray" },
      { name: "Ilse V.", date: "2026-06-14", stars: 1, title: "Doesn't fit my new charger", text: "My charger only has a USB-C port and these have the old rectangular plug on the other end. Can't use them with it at all. Should have read better I guess.", verified: false, helpful: 52, variant: "Color: Cardinal red" },
      { name: "Gideon R.", date: "2026-08-02", stars: 4, title: "Not the fastest", text: "Fine for overnight. My Galaxy S23 says charging but not super fast charging with these, which makes sense since they only do 15W. Good cables otherwise.", verified: true, helpful: 21, variant: "Color: Gray" },
      { name: "Hamid S.", date: "2026-02-18", stars: 5, title: "Long enough for the couch", text: "I charge my controller from the USB port on my console while I play. 6 ft reaches the couch with room to spare.", verified: true, helpful: 11, variant: "Color: Gray" },
      { name: "Lourdes P.", date: "2025-11-20", stars: 3, title: "One of the two quit", text: "One stopped working after about 5 months, the other is still fine. For the price of two it's ok I guess.", verified: true, helpful: 15, variant: "Color: Gray" },
      { name: "Jonah Fields", date: "2024-07-15", stars: 5, title: "Good for the car", text: "car only has USB-A ports. works great, and they don't get tangled up in the cup holder", verified: false, helpful: 4, variant: "Color: Cardinal red" },
    ],
    questions: [
      { q: "Will these work with a USB-C wall charger?", a: "No. These cables have a USB-A plug on one end, so they need a charger or port with a USB-A port. For a USB-C charger you need a USB-C to USB-C cable.", by: "Seller", date: "2025-04-30", votes: 44 },
      { q: "Do both cables come in the same color?", a: "yes mine were both gray, you pick one color for the pack", by: "Lamar", date: "2024-04-01", votes: 12 },
      { q: "Can you move photos with these or is it only charging?", a: "both, I move photos to my old laptop with one. not super fast though", by: "Hamid", date: "2026-03-09", votes: 7 },
    ],
  },

  'kestrel-240w-usbc-cable': {
    summary: "Customers say it charges even large laptops at full speed and feels much sturdier than the cables that came with their devices, so one cable covers a laptop, tablet and phone. Some find 3 feet short for a desk. A few were surprised that it moves files slowly and won't send video to a monitor.",
    aspects: [
      { name: "Laptop charging", good: 820, bad: 24 },
      { name: "Build quality", good: 640, bad: 30 },
      { name: "Length", good: 210, bad: 150 },
      { name: "Data speed", good: 60, bad: 120 },
    ],
    reviews: [
      { name: "Jasper Lindqvist", date: "2026-06-09", stars: 5, title: "Full 140W on my gaming laptop", text: "My gaming laptop charges at 140W over USB-C and the cable it came with started fraying at the laptop end after about a year. I've got one of those little power meters that plugs in between and with this cable it reads the full 140W the whole time, even while I'm gaming. Braid is thick, plug ends feel sturdy. Been wrapping it up and shoving it in my backpack every day for 3 months and it still looks new", verified: true, helpful: 39 },
      { name: "Hiroshi T.", date: "2025-06-27", stars: 2, title: "No picture on my monitor", text: "Tried to hook my laptop up to my USB-C monitor with it and got nothing on the screen. It does say USB 2.0 in the description, I just missed it. Charging is fine, just don't expect video out of it", verified: true, helpful: 33 },
      { name: "Elon Tusk", date: "2026-08-11", stars: 4, title: "Could be faster", text: "240W is fine I guess. Should be 2400.", verified: false, helpful: 5 },
      { name: "Liam O'Connell", date: "2026-07-01", stars: 4, title: "Short for under the desk", text: "Great cable, but 3 ft is short when the outlet is under the desk. I had to put the charger on top of the desk. Wish there was a 6 ft one.", verified: false, helpful: 12 },
      { name: "Ignacio V.", date: "2025-09-03", stars: 5, title: "One cable for everything", text: "Laptop, iPad Pro and iPhone 16 all charge from the same charger with this one cable. Took two cables out of my bag.", verified: false, helpful: 14 },
      { name: "Holly D.", date: "2026-05-19", stars: 5, title: "Works with my 16 inch MacBook Pro", text: "Using it with a 100W charger on my 16 inch MacBook Pro, keeps charging even while I'm editing video", verified: true, helpful: 7 },
      { name: "jt_builds", date: "2025-11-08", stars: 3, title: "slow for files", text: "charges great. tried moving a 20gb video folder off my phone and it took forever, it's usb 2. know that going in", verified: false, helpful: 16 },
    ],
    questions: [
      { q: "Will this connect my laptop to a monitor?", a: "No. This is a USB 2.0 cable for charging and basic file transfer. It does not carry video to a monitor.", by: "Seller", date: "2026-05-03", votes: 26 },
      { q: "Will it fast charge an iPhone 16?", a: "yes, it charges at whatever your charger can do. my 30w charger fast charges my 16 with it", by: "Ignacio", date: "2025-09-10", votes: 8 },
    ],
  },

  'fernway-clear-magnetic-case': {
    summary: "The clear back shows off the phone's color, the fit on the iPhone 16 is good, and the magnet holds firmly on chargers, car mounts and wallets. People like how slim it is. The soft edges turn yellow after a few months and dust gets trapped under the back. A few ordered it for the iPhone 16 Pro, which it doesn't fit.",
    aspects: [
      { name: "Magnet strength", good: 1620, bad: 180 },
      { name: "Clarity", good: 1180, bad: 640 },
      { name: "Fit", good: 1450, bad: 120 },
      { name: "Protection", good: 980, bad: 150 },
      { name: "Dust inside", good: 40, bad: 310 },
    ],
    reviews: [
      { name: "Leilani K.", date: "2026-07-12", stars: 5, title: "Shows off my pink phone", text: "I got the pink iPhone 16 and did not want to cover it up so I went with the Clear one, you can see the whole back. Magnet holds on my car mount even on the bumpy road to work and it snaps right onto my charger at night, don't even have to line it up. About four months in and the back is still clear. The soft edges maybe look a tiny bit warmer in color than when I got it but you have to really look", verified: false, helpful: 41, variant: "Color: Clear" },
      { name: "Gemma W.", date: "2025-08-27", stars: 2, title: "Edges turned yellow", text: "The edges started looking yellow after about 3 months. The back is still mostly clear but the soft edges are definitely yellow now. Anti-yellowing my foot.", verified: false, helpful: 63, variant: "Color: Clear" },
      { name: "Harper J.", date: "2026-05-29", stars: 4, title: "Dust gets inside", text: "Dust and lint get stuck between the case and the phone and you can see it through the back. I take it off and wipe it out about once a week. Otherwise good case", verified: false, helpful: 25, variant: "Color: Clear" },
      { name: "Iris Tan", date: "2025-06-04", stars: 5, title: "Smoke looks great", text: "Smoke is a see-through dark gray, you can still see the phone color a little. Looks more grown up than the totally clear one.", verified: false, helpful: 10, variant: "Color: Smoke" },
      { name: "Lindsay B.", date: "2025-03-06", stars: 1, title: "Doesn't fit the 16 Pro", text: "Ordered for my iPhone 16 Pro and it does not fit, the camera hole is in the wrong spot and the case is too short. It's only for the regular 16.", verified: true, helpful: 37, variant: "Color: Smoke" },
    ],
    questions: [
      { q: "Does this fit the iPhone 16 Pro?", a: "No. This case fits the iPhone 16 (6.1-inch) only. The iPhone 16 Pro has a different size and camera.", by: "Seller", date: "2026-03-12", votes: 48 },
      { q: "Does it turn yellow?", a: "mine has a slight yellow tint on the edges after about 5 months, the back is still clear", by: "Leilani", date: "2026-08-01", votes: 22 },
      { q: "Does it work with MagSafe chargers?", a: "Yes, it snaps right on. I think you're going to love it.", by: "Tim Cookie", date: "2024-09-02", votes: 9 },
    ],
  },

  'thornback-rugged-case': {
    summary: "This case survives hard drops, and the kickstand comes in handy for videos and recipes. It's popular for work sites and for kids who drop their phones. It does make the phone bulky, a few had the kickstand hinge loosen, and several ordered it for the S24+ or Ultra, which it doesn't fit.",
    aspects: [
      { name: "Protection", good: 820, bad: 40 },
      { name: "Kickstand", good: 610, bad: 120 },
      { name: "Fit", good: 540, bad: 110 },
      { name: "Grip", good: 430, bad: 30 },
      { name: "Bulk", good: 160, bad: 290 },
    ],
    reviews: [
      { name: "Grayson P.", date: "2026-05-21", stars: 5, title: "Fell off a ladder onto concrete", text: "Electrician here, my phone lives in my shirt pocket on job sites. Last month it slipped out when I was maybe 8 feet up a ladder and hit a concrete floor. Case got a scuff on one corner, phone has nothing on it, screen protector didn't even crack. I use the kickstand to prop up wiring diagrams on a panel too. Yes it's thick. That's why I bought it", verified: true, helpful: 44, variant: "Color: Black" },
      { name: "Imani R.", date: "2026-03-03", stars: 1, title: "Wrong size for the Ultra", text: "Bought this for my S24 Ultra. It's only for the regular S24 and way too small. The return was easy at least.", verified: true, helpful: 29, variant: "Color: Navy" },
      { name: "Lorenzo D.", date: "2026-07-26", stars: 4, title: "Bulky but tough", text: "It's thick. My phone doesn't slide into my jeans pocket as easily anymore. But I'm not worried about drops at all.", verified: true, helpful: 14, variant: "Color: Olive" },
      { name: "Jerome W.", date: "2025-09-30", stars: 3, title: "Kickstand got loose", text: "kickstand hinge got wobbly after about 2 months, now it only holds at one angle. rest of the case is fine", verified: true, helpful: 18, variant: "Color: Black" },
      { name: "Karina S.", date: "2026-06-06", stars: 5, title: "Great for recipes", text: "I prop it up on the kitchen counter to follow recipes. The Olive is a nice army green, not too bright.", verified: true, helpful: 7, variant: "Color: Olive" },
      { name: "Hugh M.", date: "2026-04-15", stars: 5, title: "Wireless charging still works", text: "Charges on my wireless pad with the case on, as long as the kickstand is folded flat.", verified: true, helpful: 9, variant: "Color: Black" },
      { name: "Luz", date: "2026-09-14", stars: 5, title: "good case", text: "good case for my son, he drops everything", verified: true, helpful: 2, variant: "Color: Navy" },
      { name: "Garrett F.", date: "2026-02-26", stars: 4, title: "Buttons are stiff", text: "Fits my S24 good and feels tough. Volume buttons take a pretty firm press. I paid for next day shipping and it actually came the next day", verified: true, helpful: 3, variant: "Color: Black" },
    ],
    questions: [
      { q: "Will this fit the Galaxy S24+?", a: "No. This case fits the Galaxy S24 (6.2-inch) only. It does not fit the S24+, S24 Ultra or S24 FE.", by: "Seller", date: "2026-03-10", votes: 33 },
      { q: "Does it work with a glass screen protector?", a: "yes I have a glass one on and the edges of the case don't push it up", by: "Grayson", date: "2026-06-01", votes: 10 },
    ],
  },

  'rb-screen-protector-3pack': {
    summary: "The frame in the box makes it easy to put a protector on straight, and the glass is clear. Having spares is good value, and a lot of people say a protector cracked in a drop while the screen underneath was fine. Some got a small bubble or an edge lifting under a thick case, and a few bought them for Pro models, which they don't fit.",
    aspects: [
      { name: "Ease of install", good: 2400, bad: 520 },
      { name: "Clarity", good: 1950, bad: 90 },
      { name: "Durability", good: 1380, bad: 340 },
      { name: "Case fit", good: 860, bad: 140 },
      { name: "Value", good: 1700, bad: 30 },
    ],
    reviews: [
      { name: "Ji-woo P.", date: "2026-06-23", stars: 5, title: "Even I could put it on straight", text: "I am terrible at screen protectors, I've ruined so many lol. This one has a plastic frame that fits over the phone, you just drop the glass in and press from the middle. Did it in the bathroom after a shower so less dust, and no bubbles at all. A month later I dropped my phone at the bus stop, protector cracked but my actual screen was fine. Second one took me like 5 minutes. Still have one left", verified: true, helpful: 58 },
      { name: "Gene K.", date: "2025-03-11", stars: 1, title: "Doesn't fit the 15 Pro", text: "Bought these for my iPhone 15 Pro. The cutout at the top is in the wrong place and the edges don't line up. They're only for the regular 15 and 16.", verified: true, helpful: 34 },
      { name: "Lakshmi R.", date: "2026-08-07", stars: 4, title: "One small bubble", text: "The frame made it really easy. Got one tiny bubble in a corner that never went away but it's still very clear otherwise", verified: true, helpful: 8 },
      { name: "Heath B.", date: "2026-07-19", stars: 5, title: "Took the hit", text: "Dropped my phone on the driveway. Protector cracked, screen underneath was fine. Put on number 2 in a few minutes.", verified: true, helpful: 19 },
      { name: "Kendall O.", date: "2026-09-09", stars: 3, title: "Edge lifts with my case", text: "With my thick case on, one edge of the protector started lifting after a few weeks and now there's a white line along the side.", verified: true, helpful: 12 },
      { name: "Isadora L.", date: "2026-03-27", stars: 5, title: "Face ID still works", text: "Face ID and the front camera work like normal. Touch feels the same too.", verified: true, helpful: 4 },
      { name: "Lionel F.", date: "2026-05-15", stars: 5, title: "Good deal", text: "3 for under 10 dollars, can't beat it.", verified: true, helpful: 2 },
      { name: "Hattie", date: "2025-11-13", stars: 5, title: "easy", text: "easy to put on", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Will this fit the iPhone 16 Pro?", a: "No. These fit iPhone 16 and iPhone 15 (6.1-inch) only. They do not fit Plus, Pro or Pro Max models.", by: "Seller", date: "2025-03-19", votes: 45 },
      { q: "any tips for keeping dust off when you put it on?", a: "use the little sticker in the kit to pick up dust. do it in the bathroom after a hot shower, way less dust", by: "Ji-woo", date: "2026-07-01", votes: 14 },
    ],
  },

  'pebble-20k-powerbank': {
    summary: "It charges a phone about four times and three things at once, and reviewers find the screen with the exact percent useful. It goes camping, on trips, or into a drawer for power cuts. The common complaint is that it's heavy to carry every day, and some say it takes a long time to recharge from an older, slower charger.",
    aspects: [
      { name: "Capacity", good: 1180, bad: 60 },
      { name: "Multiple ports", good: 640, bad: 25 },
      { name: "Charging speed", good: 760, bad: 90 },
      { name: "Display", good: 520, bad: 30 },
      { name: "Weight", good: 160, bad: 420 },
    ],
    reviews: [
      { name: "Levi Brandt", date: "2025-08-04", stars: 5, title: "Lasted a 4 day camping trip", text: "Took this on a 4 day camping trip, no power at the site. Charged my phone and my wife's phone every night and we charged the headlamp off the USB-A port once. Got home and the screen still said 18%. It's heavy though, like carrying a can of soup around in your bag, so I wouldn't bring it every day.", verified: true, helpful: 36, variant: "Color: Black" },
      { name: "Gianna R.", date: "2026-05-02", stars: 2, title: "Too heavy for my purse", text: "It's over 12 ounces and you feel it. I wanted something to carry every day and this is more of a travel thing. Going to try a smaller one.", verified: true, helpful: 27, variant: "Color: White" },
      { name: "Kwabena O.", date: "2026-06-29", stars: 5, title: "The percent screen is great", text: "I like seeing the exact percent instead of guessing from little dots.", verified: true, helpful: 9, variant: "Color: Black" },
      { name: "Harold T.", date: "2026-03-18", stars: 4, title: "Slow to recharge with an old charger", text: "Took most of the night to recharge with my old 12W charger. With a 30W USB-C charger it's about 3 and a half hours like they say.", verified: true, helpful: 15, variant: "Color: Black" },
      { name: "Jules", date: "2025-08-08", stars: 5, title: "kept my switch going", text: "charged my switch while i played on a 5 hour flight and still had plenty left", verified: true, helpful: 4, variant: "Color: White" },
      { name: "Iman F.", date: "2025-04-20", stars: 5, title: "Good for power outages", text: "Power went out for a day and a half after a storm and this kept both our phones going the whole time", verified: true, helpful: 22, variant: "Color: Black" },
      { name: "Elon Tusk", date: "2026-10-05", stars: 4, title: "Decent battery", text: "Charged my phone 4 times on one charge. Wish it could charge my car.", verified: true, helpful: 1, variant: "Color: Black" },
    ],
    questions: [
      { q: "Does it come with a wall charger?", a: "no, just a short usb-c cable and a pouch", by: "Harold", date: "2026-03-25", votes: 17 },
      { q: "Can it charge a laptop?", a: "my MacBook Air yes, slowly. it's 30w max", by: "Redbird Customer", date: "2025-08-15", votes: 10 },
    ],
  },

  'northloop-air-earbuds': {
    summary: "Reviewers call these good value. The battery lasts close to the 6 hours listed, they hold up to sweat and rain during workouts, and the case is small. There's no noise cancelling, which makes them hard to hear on buses and trains, and a few say one earbud sometimes drops the connection.",
    aspects: [
      { name: "Value", good: 1240, bad: 180 },
      { name: "Battery life", good: 980, bad: 140 },
      { name: "Sound quality", good: 860, bad: 390 },
      { name: "Fit", good: 760, bad: 260 },
      { name: "Noise cancelling", good: 40, bad: 520 },
    ],
    reviews: [
      { name: "Jae-min L.", date: "2025-04-26", stars: 5, title: "Survived a rainstorm on a 10 mile run", text: "training for a half marathon and wanted cheap earbuds I don't have to baby. halfway through a 10 mile run it started pouring, I was soaked in sweat and rain for like an hour and they kept playing the whole time. still work fine a month later. medium tips and they don't move at all when I run. battery is around 6 hours like it says and I charge the case maybe once a week", verified: true, helpful: 31, variant: "Color: Black" },
      { name: "Ga-eun K.", date: "2025-05-31", stars: 2, title: "Can't hear them on the subway", text: "Couldn't hear my podcast over the train on the subway even at full volume. I didn't notice they have no noise cancelling. They're fine at the gym but I mostly bought them for my commute so", verified: true, helpful: 46, variant: "Color: White" },
      { name: "Lyle S.", date: "2026-07-14", stars: 4, title: "Good for the price", text: "Sound is ok, bass is decent. Not as good as the expensive ones but for 30 dollars I'm happy.", verified: true, helpful: 10, variant: "Color: Black" },
      { name: "Kamal H.", date: "2026-08-26", stars: 3, title: "Left one drops out", text: "every so often the left one cuts out for a second. forgot them and paired again, helped a little", verified: true, helpful: 14, variant: "Color: Sage" },
      { name: "Jocelyn A.", date: "2025-05-03", stars: 5, title: "Sage is cute", text: "Sage is a soft gray green. The case is small enough for the little coin pocket on my jeans.", verified: true, helpful: 7, variant: "Color: Sage" },
      { name: "Jeremiah T.", date: "2026-04-19", stars: 5, title: "Calls sound clear", text: "People say I sound clear on calls, even when I'm outside walking.", verified: true, helpful: 5, variant: "Color: Black" },
      { name: "hoopsdad22", date: "2026-09-16", stars: 4, title: "stay in", text: "stay in my ears playing basketball. had to switch to the small tips", verified: true, helpful: 3, variant: "Color: White" },
    ],
    questions: [
      { q: "Do these have noise cancelling?", a: "No. These earbuds do not have active noise cancelling. The microphones only reduce background noise on calls.", by: "Seller", date: "2026-04-06", votes: 41 },
      { q: "Do they work with iPhone?", a: "yes paired with my iphone 15 right away", by: "Jocelyn", date: "2025-05-15", votes: 4 },
    ],
  },

  'northloop-pocket-speaker': {
    summary: "Owners say it's loud for its size and really is waterproof, and the strap makes it easy to hang in the shower or clip to a bag or kayak. Pairing two for stereo is popular. The bass is thin and it sounds harsh at full volume, and a few had it stop charging after several months.",
    aspects: [
      { name: "Sound quality", good: 920, bad: 150 },
      { name: "Waterproofing", good: 780, bad: 40 },
      { name: "Battery life", good: 690, bad: 90 },
      { name: "Size", good: 610, bad: 20 },
      { name: "Bass", good: 340, bad: 210 },
    ],
    reviews: [
      { name: "Jared K.", date: "2025-08-20", stars: 5, title: "Fell in the lake and kept playing", text: "Had it strapped to my kayak. Tipped over in shallow water by the shore and it took me maybe 30 seconds to fish it out and it was STILL playing. It doesn't float though so tie the strap to something. Battery lasted the whole day on the water, like 8 hours of music at medium volume", verified: true, helpful: 42, variant: "Color: Ocean blue" },
      { name: "Ilana B.", date: "2026-05-09", stars: 3, title: "Not much bass", text: "Loud enough for the shower or a small patio but not much bass, even with bass boost on. Kind of tinny at full volume", verified: true, helpful: 19, variant: "Color: Black" },
      { name: "Graham T.", date: "2025-10-14", stars: 5, title: "Paired two for the backyard", text: "Bought two and paired them for stereo in the backyard. Works well and they stay connected.", verified: true, helpful: 11, variant: "Color: Cardinal red" },
      { name: "Lukas W.", date: "2026-06-25", stars: 4, title: "Charging flap is fiddly", text: "You have to push the rubber flap over the USB-C port all the way closed or it isn't waterproof. A little fiddly with wet hands.", verified: true, helpful: 13, variant: "Color: Black" },
      { name: "Hamza Q.", date: "2026-09-22", stars: 2, title: "Stopped charging", text: "After 5 months it won't charge anymore, the light just blinks red. It was great until then.", verified: true, helpful: 16, variant: "Color: Cardinal red" },
    ],
    questions: [
      { q: "Does it float?", a: "No. It is waterproof (IPX7) and can be underwater for up to 30 minutes at 3 feet, but it does not float.", by: "Seller", date: "2026-06-02", votes: 27 },
      { q: "Can you pair it with a different speaker for stereo?", a: "i don't think so, i paired two of these. as far as I know it only works with another one of the same", by: "Graham", date: "2025-10-20", votes: 9 },
      { q: "How long does it take to charge?", a: "about 2 and a half hours from dead for me", by: "Redbird Customer", date: "2026-07-07", votes: 5 },
    ],
  },

  // ── More home & kitchen, clothing & shoes ─────────────────────────────────
  'hearth-oak-dutch-oven': {
    summary: "It cooks evenly, holds heat a long time and bakes bread with a crisp crust. People like the colors and say the enamel cleans up easily by hand. It's very heavy when full, the cream inside stains a little from tomato sauce, and a few arrived with small chips on the rim.",
    aspects: [
      { name: "Cooking results", good: 640, bad: 30 },
      { name: "Heat retention", good: 520, bad: 20 },
      { name: "Ease of cleaning", good: 340, bad: 120 },
      { name: "Color", good: 300, bad: 40 },
      { name: "Weight", good: 110, bad: 260 },
    ],
    reviews: [
      { name: "Mabel Ortega", date: "2026-03-22", stars: 5, title: "Sourdough every Sunday now", text: "Bought it mostly for bread. 8 loaves so far at 475 with the lid on the first 20 minutes and every single one came out with that crackly crust. Also did a beef stew in the oven at 300 for three hours and nothing dried out. The cream inside is nice because you can actually see when the onions are browning, didn't think about that until I used it. Hand washing is easy. Only thing that's stuck was a burnt sugar spot and that came off after soaking overnight", verified: true, helpful: 74, variant: "Color: Cardinal red" },
      { name: "Marjorie T.", date: "2025-07-04", stars: 3, title: "Too heavy for me", text: "Beautiful pot and it cooks great. But it's 13 pounds empty and I've had weak wrists since a fracture last year. With soup in it I can't lift it off the stove by myself, I have to ladle most of it out first. The loop handles are wide which helps some, it's just the weight. Anyone with hand or wrist problems might want something lighter.", verified: true, helpful: 52, variant: "Color: Cream" },
      { name: "Malik Bennett", date: "2026-08-19", stars: 5, title: "Chili for 10", text: "Made a double batch of chili for game day and it fit with room to spare. Stays hot a long time after you turn the burner off.", verified: true, helpful: 18, variant: "Color: Slate" },
      { name: "Mandy K.", date: "2026-04-11", stars: 4, title: "Cream inside stains a little", text: "Love it but the cream enamel inside has a light brown ring now after a few months of tomato sauce. A baking soda paste got most of it out.", verified: true, helpful: 23, variant: "Color: Cardinal red" },
      { name: "Megan Doyle", date: "2026-09-27", stars: 2, title: "Chipped on the rim", text: "Got a small chip on the outside of the rim after knocking it against the faucet while washing. Ive barely had it 2 months. Contacted them about the lifetime warranty and they asked for photos, still waiting to hear back.", verified: true, helpful: 31, variant: "Color: Slate" },
      { name: "Mateo V.", date: "2026-02-26", stars: 5, title: "Works on my induction stove", text: "works great on my induction stove. heats evenly, no hot spot in the middle like my old pot", verified: true, helpful: 9, variant: "Color: Cream" },
      { name: "Miriam Katz", date: "2025-09-08", stars: 5, title: "Red is a true red", text: "The Cardinal red is a deep red, not orange at all. Looks great sitting on the stove.", verified: true, helpful: 6, variant: "Color: Cardinal red" },
    ],
    questions: [
      { q: "Is it dishwasher safe?", a: "We recommend washing it by hand with warm soapy water. The dishwasher can dull the enamel over time.", by: "Seller", date: "2026-03-04", votes: 28 },
      { q: "Can the knob really go in the oven at 500?", a: "yes the knob is metal, I bake bread at 475 with the lid on all the time", by: "Mabel", date: "2026-04-02", votes: 15 },
      { q: "How wide is it?", a: "about 10 inches across inside, closer to 13 with the handles", by: "Redbird Customer", date: "2026-08-27", votes: 5 },
    ],
  },

  'tidewell-glass-containers': {
    summary: "Meal preppers like that these don't leak, the glass doesn't stain or hold smells, and the three sizes cover most needs. The glass can go from the fridge into the oven or microwave. The locking tabs on the lids can break after a few months, the silicone seal can hold strong smells, and the glass is heavy to carry.",
    aspects: [
      { name: "Leakproof", good: 1840, bad: 210 },
      { name: "Glass quality", good: 1520, bad: 90 },
      { name: "Sizes", good: 880, bad: 110 },
      { name: "Lids", good: 620, bad: 740 },
      { name: "Weight", good: 160, bad: 290 },
    ],
    reviews: [
      { name: "Neha R.", date: "2026-05-15", stars: 5, title: "Meal prep Sundays", text: "I meal prep lunches for me and my husband every Sunday and these replaced a whole drawer of stained plastic stuff. Big ones fit a full portion of rice and curry, mediums are good for salad, the little one I use for dressing or yogurt. I've gone straight from the fridge to the oven at 400 to reheat and no problems, just take the lids off first!! Turmeric used to stain all our plastic yellow and these are still totally clear", verified: true, helpful: 88 },
      { name: "Nelson Ibarra", date: "2025-06-23", stars: 2, title: "Lid tab snapped", text: "One of the locking tabs on a big lid snapped off after about 3 months. Now that lid doesn't seal on one side. Glass is great, lids not so much.", verified: true, helpful: 47 },
      { name: "Nadine C.", date: "2026-03-30", stars: 4, title: "Seal smells like garlic", text: "Everything about these is good except the silicone ring in the lid held onto the smell of garlic pasta for like a week. You can pull the ring out to wash it, that helped but it took a few washes", verified: false, helpful: 29 },
      { name: "Noor A.", date: "2026-09-03", stars: 5, title: "Didn't leak in my backpack", text: "Carried soup in the big one in my backpack on the bus. Not a drop leaked.", verified: false, helpful: 14 },
      { name: "Nathaniel P.", date: "2025-01-12", stars: 4, title: "Heavy", text: "Good containers but glass is heavy. Two of the big ones full of food in a lunch bag is a lot to carry around all day.", verified: false, helpful: 11 },
      { name: "Nicola S.", date: "2026-06-18", stars: 5, title: "They nest", text: "They stack inside each other so the whole set fits in one corner of the cabinet. love that", verified: true, helpful: 7 },
      { name: "Nils Bergstrom", date: "2025-08-30", stars: 3, title: "Tabs are hard to snap", text: "I have carpal tunnel in both hands and pushing all four tabs down is hard for me, and getting them open again is harder. My daughter helps sometimes. The glass is very nice quality though.", verified: true, helpful: 36 },
    ],
    questions: [
      { q: "Can the lids go in the microwave?", a: "You can rest the lid on top with the tabs open to stop splatters, but do not lock it while microwaving. The lids should not go in the oven.", by: "Seller", date: "2026-03-11", votes: 33 },
      { q: "Is the glass oven safe?", a: "yes, i reheat in them at 375 all the time. lids off though", by: "Neha", date: "2026-06-01", votes: 19 },
      { q: "Are the lids BPA free?", a: "yes it says BPA free on the box", by: "Redbird Customer", date: "2025-08-14", votes: 6 },
      { q: "Can they go in the freezer?", a: "Yes. The glass can go from the freezer to the microwave or the oven. Take the lids off before it goes in the oven.", by: "Seller", date: "2026-07-19", votes: 6 },
    ],
  },

  'wrenfield-percale-sheets': {
    summary: "Hot sleepers like how cool and crisp these feel, and say they get softer with every wash. The deep fitted sheet stays on thick mattresses. They do wrinkle a lot, they can feel scratchy next to silky sheets, and some wish they came in sizes other than queen.",
    aspects: [
      { name: "Coolness", good: 980, bad: 60 },
      { name: "Fit", good: 720, bad: 80 },
      { name: "Softness", good: 640, bad: 380 },
      { name: "Color", good: 410, bad: 50 },
      { name: "Wrinkles", good: 90, bad: 520 },
    ],
    reviews: [
      { name: "Octavia B.", date: "2026-06-28", stars: 5, title: "Finally I don't wake up sweaty", text: "I run hot and my husband keeps the heat up so I've been kicking the covers off for years. These are the first sheets that actually feel cool when I get in bed. Little stiff out of the package, like a new dress shirt, but after 3 washes they're soft and still cool. Yes they wrinkle. Once you're lying in bed who cares. The deep pocket fits our 14 inch mattress plus a topper", verified: true, helpful: 66, variant: "Color: White" },
      { name: "Oksana V.", date: "2026-04-03", stars: 2, title: "Scratchy, not what I expected", text: "I thought percale would be soft and smooth. These feel crisp and almost papery to me. My husband likes them, I don't. If you like silky sheets this isn't it.", verified: true, helpful: 41, variant: "Color: Oatmeal" },
      { name: "Oliver Tran", date: "2026-08-12", stars: 4, title: "So many wrinkles", text: "Cool and comfortable but they come out of the dryer looking like a crumpled paper bag. I take them out right away and put them on the bed warm and it helps.", verified: true, helpful: 22, variant: "Color: Slate" },
      { name: "Omari J.", date: "2026-05-21", stars: 5, title: "Fits a thick mattress", text: "Our mattress is 15 inches and the fitted sheet stays on all night. our old ones kept popping off the corner", verified: true, helpful: 13, variant: "Color: Sage green" },
      { name: "Odette L.", date: "2026-09-16", stars: 5, title: "Sage is a calm green", text: "The Sage green is a muted gray green, very calm. Matches my curtains.", verified: true, helpful: 8, variant: "Color: Sage green" },
      { name: "Orlando G.", date: "2026-03-08", stars: 4, title: "Wish they made a king", text: "Love these on our guest bed. Wanted a set for our king bed too but they only come in queen.", verified: true, helpful: 10, variant: "Color: White" },
      { name: "Otis W.", date: "2026-10-02", stars: 5, title: "Better after washing", text: "Every wash they get a little softer. Had them 3 months now.", verified: true, helpful: 4, variant: "Color: Slate" },
    ],
    questions: [
      { q: "Do they come in king?", a: "This set is only made in queen size right now.", by: "Seller", date: "2026-04-20", votes: 24 },
      { q: "Is the White see-through?", a: "no, they're pretty opaque for white sheets", by: "Octavia", date: "2026-07-12", votes: 9 },
      { q: "How do you tell which side of the fitted sheet is the long side?", a: "there's a small tag sewn on one of the short ends", by: "Redbird Customer", date: "2026-05-30", votes: 7 },
      { q: "Will the fitted sheet fit a mattress with a topper?", a: "mine is 12 inches plus a 2 inch topper and it fits with room to spare", by: "Lena", date: "2025-08-22", votes: 9 },
    ],
  },

  'tidewell-milk-frother': {
    summary: "Customers say it makes thick foam quickly with one button and runs quietly, and they like that the jug lifts off the base and goes in the dishwasher. The small whisk is easy to lose, results with oat milk vary, and a few stopped heating after a few months.",
    aspects: [
      { name: "Foam quality", good: 1480, bad: 160 },
      { name: "Ease of use", good: 1210, bad: 70 },
      { name: "Cleaning", good: 860, bad: 240 },
      { name: "Noise", good: 520, bad: 40 },
      { name: "Durability", good: 300, bad: 210 },
    ],
    reviews: [
      { name: "Paige H.", date: "2025-01-20", stars: 5, title: "Cut my coffee shop habit", text: "Was spending way too much on lattes. Now I make espresso in a cheap stovetop pot and this does the milk. Hot foam with 2% gets thick foam that lasts while I drink it, and cold foam on iced coffee is my new favorite thing. The jug comes off the base and goes in the dishwasher, didn't expect that for the price. The whisk is TINY though, I almost poured it down the sink twice. good thing they give you a spare", verified: false, helpful: 79, variant: "Color: Matte black" },
      { name: "Pascal D.", date: "2026-05-06", stars: 2, title: "Stopped heating after 4 months", text: "Worked great until month 4, then it would spin but not heat. The light on the base still comes on. Sent it back for a replacement.", verified: true, helpful: 34, variant: "Color: Brushed steel" },
      { name: "Petra K.", date: "2025-09-14", stars: 4, title: "Oat milk results vary", text: "Whole milk foams perfectly. With oat milk it depends on the kind, the barista style ones foam well and the regular ones go flat fast. Not really the frother's fault.", verified: false, helpful: 27, variant: "Color: Matte black" },
      { name: "Peggy L.", date: "2025-08-01", stars: 5, title: "Hot chocolate for the kids", text: "Warm milk setting makes hot chocolate for my two kids every morning. It turns itself off so I don't worry if I walk away.", verified: true, helpful: 12, variant: "Color: Brushed steel" },
      { name: "Penelope A.", date: "2026-03-27", stars: 4, title: "Don't fill past the line", text: "filled it past the max line once and foam came out the top and all over the base. stay under the line and it's fine", verified: true, helpful: 18, variant: "Color: Matte black" },
      { name: "Prakash V.", date: "2026-06-25", stars: 5, title: "Quiet", text: "Much quieter than my old one. I can make a latte at 6am without waking anyone up.", verified: true, helpful: 7, variant: "Color: Brushed steel" },
      { name: "Pierre M.", date: "2026-08-20", stars: 3, title: "Coating scratched", text: "The non stick inside got a scratch from a spoon and now milk sticks in that spot. Use a soft sponge only.", verified: false, helpful: 15, variant: "Color: Matte black" },
      { name: "Piper C.", date: "2024-12-11", stars: 5, title: "Love it", text: "love it, use it every day", verified: false, helpful: 1, variant: "Color: Brushed steel" },
    ],
    questions: [
      { q: "Can the base go in the dishwasher?", a: "No. Only the jug and the whisk go in the dishwasher. Wipe the base with a damp cloth and keep it dry.", by: "Seller", date: "2025-03-02", votes: 30 },
      { q: "How long does hot foam take?", a: "a little over 2 minutes for me", by: "Paige", date: "2025-03-15", votes: 11 },
    ],
  },

  'wrenfield-pillows-2pack': {
    summary: "Comfortable and medium firm as described, these suit side and back sleepers, and the whole pillow can go in the wash. Some went flat after a few months, they're too high for stomach sleepers, and they smell like plastic when first unpacked.",
    aspects: [
      { name: "Comfort", good: 2100, bad: 540 },
      { name: "Firmness", good: 1350, bad: 820 },
      { name: "Durability", good: 480, bad: 690 },
      { name: "Washability", good: 610, bad: 180 },
      { name: "Smell", good: 90, bad: 260 },
    ],
    reviews: [
      { name: "Quentin B.", date: "2026-04-18", stars: 5, title: "Side sleeper and my neck is happy", text: "Side sleeper, I used to wake up with a stiff neck pretty much every morning. Tried these because they say medium firm. They come rolled up and vacuum sealed in a tiny box and looked like pancakes the first night lol. By the next evening they were all the way puffed up. Keeps my head level with my shoulder and my neck is mostly better after 2 weeks. Already had to wash one after the dog got on it, came out fine, dried it with two tennis balls like the tag says", verified: true, helpful: 92 },
      { name: "Rhonda B.", date: "2025-06-02", stars: 2, title: "Flat after 3 months", text: "Loved them at first. By month 3 they're about half as thick and I fold mine in half to sleep on it. Fluffing them in the dryer helps for a night or two.", verified: true, helpful: 58 },
      { name: "Ramona S.", date: "2024-05-27", stars: 3, title: "Too high for a stomach sleeper", text: "I sleep on my stomach and these push my head up too high. My husband sleeps on his back and likes his. Mine went to the guest room.", verified: true, helpful: 24 },
      { name: "Qadir S.", date: "2024-08-13", stars: 4, title: "Plastic smell at first", text: "Had a plastic smell when I unrolled them. Left them by an open window for a day and it went away.", verified: true, helpful: 16 },
      { name: "Queenie L.", date: "2025-02-15", stars: 5, title: "Washed fine", text: "Threw both in the washer on gentle and they came out good, no lumps.", verified: true, helpful: 9 },
      { name: "Rafael M.", date: "2025-10-08", stars: 4, title: "Good for the price", text: "Not a fancy hotel pillow but close enough. Medium firm is accurate.", verified: true, helpful: 6 },
      { name: "Raquel T.", date: "2024-08-10", stars: 5, title: "No feathers poking me", text: "My old feather pillows poked me all night. These are smooth and my allergies are better.", verified: true, helpful: 11 },
    ],
    questions: [
      { q: "How long until they're full size?", a: "Give them about 24 hours after you take them out of the plastic. Fluffing them by hand helps them fill out faster.", by: "Seller", date: "2026-03-20", votes: 38 },
      { q: "Do they fit a standard pillowcase?", a: "they're 20x30 so you want queen pillowcases. a standard case is too short", by: "Quentin", date: "2026-05-06", votes: 17 },
      { q: "Are these ok if you sleep hot?", a: "they stay cooler than my memory foam one but they're not cold", by: "Redbird Customer", date: "2024-08-19", votes: 8 },
    ],
  },

  'lumen-arc-floor-lamp': {
    summary: "The light is soft and even over a couch or reading chair, and people like dimming it and changing the light color with the remote. It goes together quickly without tools. The base is wider than some expected, the arm wobbles when bumped, and the built-in LED can't be replaced.",
    aspects: [
      { name: "Light quality", good: 420, bad: 50 },
      { name: "Remote", good: 310, bad: 70 },
      { name: "Assembly", good: 260, bad: 90 },
      { name: "Size", good: 180, bad: 110 },
      { name: "Stability", good: 150, bad: 120 },
    ],
    reviews: [
      { name: "Reid Lawson", date: "2026-05-09", stars: 5, title: "Reading light over my chair", text: "No ceiling light in our living room, just two table lamps, so reading at night was rough. This goes right over my recliner and lights up the page without lighting up the TV screen. Took me about 15 minutes to set up, the pole screws together in pieces and the base is the heavy part. Warm setting most nights, I switch to the bright cool one when I do puzzles. The remote sits on the side table and I use it a lot more than I thought I would", verified: true, helpful: 45, variant: "Color: Black" },
      { name: "Regina F.", date: "2026-07-19", stars: 3, title: "Base is huge", text: "Nice light but the base is wider than I pictured and it sticks out in front of the sofa. I've stubbed my toe on it twice. Measure your space.", verified: true, helpful: 28, variant: "Color: Brass" },
      { name: "Renata K.", date: "2025-09-29", stars: 2, title: "Wobbles", text: "The arm sways every time someone walks by or the dog bumps the base. Tightened all the sections and it's a little better. Light itself is good", verified: true, helpful: 21, variant: "Color: Black" },
      { name: "Rhea D.", date: "2026-03-24", stars: 5, title: "Brass is more gold", text: "The Brass is shinier and more gold than the photo, but I like it. Looks nice with our wood furniture.", verified: true, helpful: 9, variant: "Color: Brass" },
      { name: "Ricardo S.", date: "2026-06-06", stars: 4, title: "Easy to put together", text: "Took 5 days to get here which was fine. Easy to put together, no tools. The foot switch cord is kind of short.", verified: true, helpful: 6, variant: "Color: Black" },
      { name: "Rina", date: "2026-04-30", stars: 4, title: "Can't change the bulb", text: "Good light. Just know the LED is built in, there's no bulb to swap, so when it dies the whole lamp is done.", verified: true, helpful: 17, variant: "Color: Brass" },
    ],
    questions: [
      { q: "Does it work without the remote?", a: "yes the foot switch turns it on and off, but you need the remote to dim it or change the color", by: "Redbird Customer", date: "2026-08-11", votes: 6 },
    ],
  },

  'saltgrass-fleece-joggers': {
    summary: "These joggers are soft and warm with deep pockets that hold a phone, and a lot of buyers pair them with the matching Saltgrass hoodie. High heat in the dryer shrinks them. They also pill on the inner thighs and run short in the leg for tall people.",
    fit: "true to size, short in the leg for tall people",
    aspects: [
      { name: "Comfort", good: 1380, bad: 70 },
      { name: "Fit", good: 820, bad: 430 },
      { name: "Pockets", good: 610, bad: 50 },
      { name: "Shrinking", good: 60, bad: 380 },
      { name: "Pilling", good: 40, bad: 210 },
    ],
    reviews: [
      { name: "Russell K.", date: "2025-04-09", stars: 5, title: "Matching set with the hoodie", text: "Got the Heather gray to go with the Saltgrass hoodie I already had and now I basically live in the set October to April. Inside is just as soft as the hoodie. Pockets are deep enough that my phone doesn't fall out on the couch, which always happened with my old sweats. I'm 5'9 and the medium hits right at my ankle with the cuffs. Washed cold and dried low maybe 10 times now, no shrinking", verified: true, helpful: 64, variant: "Color: Heather gray, Size: M" },
      { name: "Rosemary T.", date: "2026-06-03", stars: 2, title: "Shrank in the dryer", text: "Dried them on high by accident and they shrank a good inch and a half in the leg. Now they're capris on me. Follow the tag.", verified: true, helpful: 39, variant: "Color: Navy, Size: L" },
      { name: "Ruby J.", date: "2026-08-15", stars: 4, title: "Pilling between the thighs", text: "super comfy but after a couple months they're pilling on the inner thighs. still wear them around the house all the time", verified: true, helpful: 18, variant: "Color: Black, Size: S" },
      { name: "Ruth A.", date: "2026-04-22", stars: 5, title: "Fits my husband and me", text: "Bought a pair for each of us, they really are unisex. I'm a women's medium and got the S, he got an XL.", verified: true, helpful: 12, variant: "Color: Forest green, Size: S" },
      { name: "Ronnie", date: "2025-10-08", stars: 3, title: "Short for tall guys", text: "I'm 6'3 and the XL is short in the leg, the cuffs sit above my ankle. Comfortable but I wish they had a tall size.", verified: true, helpful: 21, variant: "Color: Black, Size: XL" },
    ],
    questions: [
      { q: "Do they shrink?", a: "only if you dry them hot. i wash cold and dry low and mine are fine", by: "Russell", date: "2025-05-28", votes: 20 },
    ],
  },

  'saltgrass-high-waist-leggings': {
    summary: "The leggings are soft, stay up during workouts, and have side pockets that fit a large phone. Reviewers also say they're not see-through when bending over. They run small, though, lighter colors show sweat, and the 25-inch length is short for tall people.",
    fit: "runs small; many order a size up",
    aspects: [
      { name: "Comfort", good: 3210, bad: 180 },
      { name: "Pockets", good: 2640, bad: 120 },
      { name: "Fit", good: 1900, bad: 760 },
      { name: "Squat proof", good: 1450, bad: 210 },
      { name: "Durability", good: 820, bad: 390 },
    ],
    reviews: [
      { name: "Mercedes A.", date: "2026-05-02", stars: 5, title: "Pockets that actually hold a phone", text: "I walk 4 miles most mornings and got tired of carrying my phone the whole way. The side pockets hold my phone with the case on and it doesn't bounce or slide down. Waistband is high and doesn't roll when I bend down to tie my shoes. Did the squat test in the mirror in good light, not see through in the Black. I'm 5'4 and they hit right at my ankle. I hang dry them like the tag says and 4 months later they still look new", verified: true, helpful: 103, variant: "Color: Black, Size: M" },
      { name: "Mackenzie J.", date: "2025-09-09", stars: 3, title: "Run small", text: "I'm usually a medium and the M was so tight I could barely get them over my hips. Exchanged for a L and they fit. Order a size up.", verified: true, helpful: 47, variant: "Color: Plum, Size: L" },
      { name: "Monica F.", date: "2025-08-24", stars: 2, title: "Shows sweat", text: "The Dusty blue shows every drop of sweat after a workout, really obvious on the waistband and behind the knees. Stick with black.", verified: true, helpful: 33, variant: "Color: Dusty blue, Size: S" },
      { name: "Maxine R.", date: "2026-03-19", stars: 5, title: "Hot yoga approved", text: "Wore them to hot yoga twice a week for 2 months. They stay up and don't get heavy with sweat.", verified: true, helpful: 16, variant: "Color: Black, Size: XS" },
      { name: "Morgan E.", date: "2024-07-21", stars: 4, title: "A bit short for me", text: "I'm 5'10 and the 25 inch inseam lands above my ankle, more like a 7/8 length on me. Still love them.", verified: true, helpful: 14, variant: "Color: Olive, Size: L" },
      { name: "Miles Whitaker", date: "2024-05-08", stars: 5, title: "Bought for my wife", text: "My wife asked for these after her sister got a pair. She has 3 now.", verified: true, helpful: 4, variant: "Color: Plum, Size: M" },
      { name: "Muriel D.", date: "2025-08-26", stars: 4, title: "Some pilling", text: "A little pilling on the inner thighs after 3 months. Pockets and waistband are still great.", verified: true, helpful: 9, variant: "Color: Olive, Size: XL" },
      { name: "Misha", date: "2026-10-12", stars: 5, title: "So soft", text: "buttery is right", verified: true, helpful: 1, variant: "Color: Black, Size: S" },
    ],
    questions: [
      { q: "Do they run true to size?", a: "Many customers find they fit snug. If you are between sizes, we suggest ordering the larger size.", by: "Seller", date: "2024-03-05", votes: 52 },
      { q: "Will a big phone fit in the side pocket?", a: "my phone is a 6.7 inch with a case and it fits fine", by: "Mercedes", date: "2026-05-18", votes: 23 },
      { q: "Is the Olive see-through when you squat?", a: "not on mine, the fabric is pretty thick", by: "Redbird Customer", date: "2024-08-02", votes: 10 },
    ],
  },

  'mesa-trail-hiking-boots': {
    summary: "These keep feet dry through creeks and wet grass, grip well on rock and gravel, and support the ankles. Expect a week or so of breaking in. Some find them warm in summer and narrow for wide feet, and they only come in whole sizes.",
    fit: "true to length, narrow for wide feet",
    aspects: [
      { name: "Waterproofing", good: 520, bad: 40 },
      { name: "Comfort", good: 430, bad: 160 },
      { name: "Grip", good: 380, bad: 30 },
      { name: "Weight", good: 120, bad: 140 },
      { name: "Break-in", good: 90, bad: 170 },
    ],
    reviews: [
      { name: "Martin Eckhart", date: "2026-05-25", stars: 5, title: "Dry feet through a creek crossing", text: "Wore them around the neighborhood for a week to break them in, then took them on a 3 day backpacking trip in the Sierras. Day two we had to cross a creek about ankle deep and my socks stayed totally dry. Great grip on the granite slabs, even wet. They're heavier than my trail runners and you notice it on the uphills but I didn't roll an ankle once with a 30 lb pack. I wear an 11 in everything and the 11 was fine with wool socks", verified: true, helpful: 57, variant: "Color: Brown, Size: 11" },
      { name: "mtnhiker88", date: "2026-07-11", stars: 2, title: "Blisters out of the box", text: "Wore them on a 6 mile hike the day they came and got blisters on both heels. My fault for not breaking them in but they are stiff at first.", verified: true, helpful: 34, variant: "Color: Gray / red, Size: 9" },
      { name: "Magnus H.", date: "2026-04-14", stars: 4, title: "Hot in summer", text: "Waterproof means they don't breathe much. In July my feet were sweaty after an hour. Great in spring and fall.", verified: true, helpful: 19, variant: "Color: Brown, Size: 10" },
      { name: "Mitchell B.", date: "2025-10-26", stars: 5, title: "Good grip", text: "Steep loose gravel on the way down and didn't slip once. Toe cap saved me from a few rocks too", verified: true, helpful: 11, variant: "Color: Gray / red, Size: 12" },
      { name: "Marcy L.", date: "2026-03-03", stars: 4, title: "Got them for my son", text: "Bought these for my son for scout camp. He says they're comfortable after the first week. Wish they came in half sizes, he's a 10.5 and we went with the 11.", verified: true, helpful: 13, variant: "Color: Brown, Size: 11" },
      { name: "Minh P.", date: "2026-06-30", stars: 3, title: "A little narrow", text: "I have wide feet and these pinch on the outside of my foot. Fine for short hikes, not for all day.", verified: true, helpful: 15, variant: "Color: Gray / red, Size: 10" },
      { name: "M. Fontaine", date: "2025-09-19", stars: 5, title: "Use them for yard work too", text: "Wear them for yard work and walking the dog in the rain. Still waterproof after 5 months.", verified: true, helpful: 6, variant: "Color: Brown, Size: 10" },
    ],
    questions: [
      { q: "Do they come in wide?", a: "These boots come in regular width only.", by: "Seller", date: "2026-04-04", votes: 22 },
      { q: "Do they come in half sizes?", a: "no, whole sizes only. we went up from 10.5 to 11 and it's fine with thick socks", by: "Marcy", date: "2026-04-10", votes: 16 },
    ],
  },

  'saltgrass-puffer-vest': {
    summary: "It's warm for how light it is and packs small for travel, and buyers like the colors and the zip pockets. It's only water resistant, so it soaks through in heavy rain. The armholes are roomy and the zipper can snag.",
    fit: "true to size, fits over a sweater",
    aspects: [
      { name: "Warmth", good: 420, bad: 60 },
      { name: "Packability", good: 380, bad: 40 },
      { name: "Fit", good: 300, bad: 110 },
      { name: "Rain", good: 150, bad: 120 },
      { name: "Zipper", good: 70, bad: 90 },
    ],
    reviews: [
      { name: "Noelle W.", date: "2026-03-28", stars: 5, title: "Great for travel", text: "Brought this to Portugal for 2 weeks and it lived in my backpack. Packs into its own chest pocket, ends up about the size of a burrito. Cool mornings and windy nights by the water it was just enough over a long sleeve tee. Light drizzle beaded right off. I'm normally a small and the S fits with room for a sweater under it. Got the Sage, it's a soft green and went with everything I packed", verified: true, helpful: 48, variant: "Color: Sage, Size: S" },
      { name: "N. Adeyemi", date: "2026-05-17", stars: 2, title: "Not for real rain", text: "Got caught in a downpour walking home and it soaked through in about 10 minutes. I know it says water resistant, but I was hoping for more. Fine for drizzle.", verified: true, helpful: 26, variant: "Color: Black, Size: M" },
      { name: "Nyla", date: "2025-10-10", stars: 4, title: "Armholes a bit big", text: "Warm and light. The armholes are a little roomy so cold air gets in on windy days. I wear it over a fleece and that fixes it.", verified: true, helpful: 12, variant: "Color: Cardinal red, Size: XS" },
      { name: "nightowl_jen", date: "2026-02-17", stars: 5, title: "warm for how thin it is", text: "surprisingly warm for how thin it is. i wear it to walk the dog every morning", verified: true, helpful: 8, variant: "Color: Black, Size: L" },
      { name: "Ngozi E.", date: "2026-07-06", stars: 3, title: "Zipper snags", text: "The main zipper catches on the inside fabric almost every time I zip it up fast. Have to go slow. Otherwise a nice vest.", verified: true, helpful: 15, variant: "Color: Sage, Size: M" },
      { name: "Nanette K.", date: "2026-04-26", stars: 5, title: "Easy to spot", text: "The Cardinal red is a deep red that's easy to spot on the trail. Good for hiking in the fall.", verified: true, helpful: 6, variant: "Color: Cardinal red, Size: L" },
      { name: "Natalia B.", date: "2026-08-05", stars: 4, title: "Packing it back is fiddly", text: "Getting it back in the pocket takes some stuffing, the first few times it took me two tries. Gets easier", verified: true, helpful: 9, variant: "Color: Black, Size: S" },
      { name: "Noriko", date: "2025-11-10", stars: 5, title: "Love", text: "light and cozy", verified: true, helpful: 1, variant: "Color: Sage, Size: XL" },
    ],
    questions: [
      { q: "Is this filled with down?", a: "No. It is filled with synthetic insulation, not down or feathers.", by: "Seller", date: "2026-03-09", votes: 19 },
      { q: "Does it fit over a sweater?", a: "yes, i got my usual small and wear a sweater under it", by: "Noelle", date: "2026-04-14", votes: 10 },
    ],
  },

  'saltgrass-oxford-shirt': {
    summary: "The cotton is thick, the collar holds its shape and the slim cut is popular, but it runs small through the belly, so some went up a size, and it wrinkles a lot despite what the title says.",
    fit: "slim; size up if you are between sizes",
    aspects: [
      { name: "Fabric", good: 740, bad: 90 },
      { name: "Fit", good: 620, bad: 540 },
      { name: "Color", good: 360, bad: 40 },
      { name: "Sleeve length", good: 150, bad: 120 },
      { name: "Wrinkles", good: 80, bad: 410 },
    ],
    reviews: [
      { name: "Preston Hall", date: "2026-04-01", stars: 4, title: "Good shirt, size up", text: "5'11, 175 lbs with a bit of a belly, normally a large. The large fit my shoulders but pulled at the buttons over my stomach so I swapped it for an XL and that's right. Nice thick oxford, not see through even the White, and the button down collar stays put under a sweater. Wrinkle resistant is a stretch though. Its ok out of the dryer if I hang it right away but after a day at the office it's creased like any other cotton shirt", verified: true, helpful: 61, variant: "Color: White, Size: XL" },
      { name: "Palmer Reid", date: "2026-06-15", stars: 2, title: "Wrinkles all the time", text: "Says wrinkle resistant right in the title. It is not. I have to iron it every time or it looks slept in.", verified: true, helpful: 38, variant: "Color: Light blue, Size: M" },
      { name: "Parker S.", date: "2025-09-03", stars: 5, title: "Slim fit that's actually slim", text: "I'm thin and most shirts are tents on me. This one fits close without being tight. Finally.", verified: false, helpful: 17, variant: "Color: Light blue, Size: S" },
      { name: "Parisa N.", date: "2026-03-05", stars: 5, title: "For my husband's interviews", text: "Got him this one in Light blue for job interviews and he looked really sharp. collar has held up fine in the wash", verified: false, helpful: 9, variant: "Color: Light blue, Size: L" },
      { name: "Percy", date: "2026-09-23", stars: 3, title: "Sleeves short", text: "Fit in the body is good but the sleeves end above my wrist bone on the L. I have long arms.", verified: false, helpful: 12, variant: "Color: Pink, Size: L" },
      { name: "Philippa W.", date: "2026-05-29", stars: 5, title: "Pink is soft", text: "The Pink is a pale, soft pink, not loud. My son wears it to church every week.", verified: false, helpful: 5, variant: "Color: Pink, Size: M" },
      { name: "Prudence O.", date: "2025-08-18", stars: 4, title: "Shrank a little", text: "Shrank maybe half an inch in the sleeves after the first wash, even on cold. Still fits.", verified: true, helpful: 7, variant: "Color: White, Size: XXL" },
      { name: "pnw_dad", date: "2026-10-04", stars: 5, title: "nice shirt", text: "nice shirt for the price", verified: false, helpful: 0, variant: "Color: White, Size: M" },
    ],
    questions: [
      { q: "Is it a true slim fit?", a: "Yes. It is cut slim through the chest and waist. If you are between sizes or like more room, order one size up.", by: "Seller", date: "2026-03-16", votes: 26 },
    ],
  },

  // ── More sports & outdoors, books, grocery, toys ──────────────────────────
  'foxglove-tumbler-40oz': {
    summary: "Ice lasts a whole day, it fits most car cup holders, and the handle makes 40 ounces easy to carry around. It's a desk water bottle for some people and an iced coffee cup in the car for others. It spills or leaks if it tips over or goes in a bag, and a few find it heavy when full.",
    aspects: [
      { name: "Keeps cold", good: 4120, bad: 130 },
      { name: "Cup holder fit", good: 2610, bad: 310 },
      { name: "Handle", good: 1880, bad: 95 },
      { name: "Size", good: 1490, bad: 420 },
      { name: "Leaks", good: 170, bad: 1260 },
    ],
    reviews: [
      { name: "Sabrina W.", date: "2026-06-09", stars: 5, title: "I drink way more water now", text: "Nurse, 12 hour shifts. I used to buy water from the vending machine and still come home with a headache. Now I fill this with ice and water before I leave and refill once at lunch and there's still ice rattling around when I clock out. Fits the cup holder in my little hatchback, my old bottle didn't. The handle is what sold me, two fingers through it and my lunch bag in the other hand. You can't throw it in a bag though, it has to stay upright", verified: true, helpful: 143, variant: "Color: Sage" },
      { name: "Terrence B.", date: "2026-04-14", stars: 2, title: "Leaked all over my work bag", text: "Put it in my tote on its side on the train and the straw lid leaked all over my laptop sleeve and my papers. Yes I know now it says not leak proof but the lid turns closed so I assumed it sealed. It does not. Keeps ice fine I guess, I just can't take it anywhere in a bag", verified: true, helpful: 187, variant: "Color: Black" },
      { name: "Thea W.", date: "2025-09-21", stars: 5, title: "Fits my cup holder", text: "The bottom is skinny even though the top is wide, so it fits my car's cup holder fine. Iced coffee still cold at 3 pm.", verified: true, helpful: 22, variant: "Color: Plum" },
      { name: "Ulysses B.", date: "2025-02-02", stars: 4, title: "Heavy when it's full", text: "40 oz of water and ice is heavy, nothing you can do about that. Handle helps a lot. Cold all day. Only 4 stars cause my wife can't drink from it laying on the couch without it dripping on her", verified: true, helpful: 11, variant: "Color: Glacier white" },
      { name: "Violet A.", date: "2026-07-30", stars: 5, title: "Ice in the morning", text: "Left it on my nightstand overnight and there was still ice in it the next morning.", verified: true, helpful: 9, variant: "Color: Glacier white" },
      { name: "Wren T.", date: "2025-10-12", stars: 3, title: "Lid is hard to get clean", text: "Cup is great. The rubber ring inside the lid collects gunk and the dishwasher doesn't really get under it, so I pry it out with a butter knife every few days. Kind of a pain", verified: true, helpful: 27, variant: "Color: Black" },
    ],
    questions: [
      { q: "Is it leak proof?", a: "No. The lid is splash resistant, but drinks can leak out of the straw opening if the tumbler tips over. We recommend keeping it upright.", by: "Seller", date: "2024-03-20", votes: 64 },
      { q: "Does it fit in a car cup holder?", a: "fits in mine, the bottom is a lot narrower than the top", by: "Thea", date: "2025-09-25", votes: 22 },
      { q: "Can the cup go in the dishwasher?", a: "the lid and straw go on the top rack. i hand wash the cup itself so the paint stays nice", by: "Redbird Customer", date: "2026-06-30", votes: 9 },
    ],
  },

  'mesa-trail-headlamp': {
    summary: "Runners and campers say it's very bright for its size, light enough to forget about, and easy to recharge over USB-C. It's also handy in a power outage. The motion sensor sometimes switches the light on or off by accident, and a few found the strap stretches out or the battery drains fast on high.",
    aspects: [
      { name: "Brightness", good: 1640, bad: 70 },
      { name: "Comfort", good: 980, bad: 160 },
      { name: "Battery life", good: 1190, bad: 220 },
      { name: "Red light", good: 510, bad: 30 },
      { name: "Motion sensor", good: 420, bad: 380 },
    ],
    reviews: [
      { name: "Simone B.", date: "2025-02-11", stars: 5, title: "Back to running in the dark", text: "It's pitch dark when I run in the winter so I just stopped for a couple months. Got this and I'm back out 4 mornings a week on the dirt path by the creek. Medium is plenty bright and it doesn't bounce once the strap is snug. I charge it with my phone cable every weekend, hasn't died on me mid run yet. Tilt it down a little or you're lighting up the trees and not the roots in front of you", verified: true, helpful: 96 },
      { name: "Silas K.", date: "2025-09-08", stars: 3, title: "Motion sensor is annoying", text: "In sensor mode it turns off every time I scratch my face or a branch goes past my head. I just use the regular button now and it's fine, but the sensor was half the reason I bought it.", verified: true, helpful: 41 },
      { name: "Tessa L.", date: "2026-08-19", stars: 5, title: "Power outage", text: "Power went out for two nights during the storm. Wore this to cook and read. Way better than holding a phone flashlight.", verified: false, helpful: 18 },
      { name: "Spencer H.", date: "2026-10-02", stars: 4, title: "High mode eats the battery", text: "High is really bright but it's down to the last bar in a little under 5 hours, a bit less when it was cold out. Medium is enough for most things.", verified: true, helpful: 13 },
      { name: "Ursula K.", date: "2025-07-22", stars: 5, title: "Red light at the campsite", text: "Camping with two little kids, the red light let me find stuff in the tent without waking them up", verified: false, helpful: 9 },
      { name: "Todd R.", date: "2025-05-04", stars: 2, title: "Strap stretched out", text: "After about two months the strap got loose and even at the tightest setting it slides down my forehead when I run. Light still works fine.", verified: false, helpful: 24 },
      { name: "Valerie D.", date: "2025-05-27", stars: 5, title: "Don't even notice it", text: "So light I forgot I had it on and walked into the grocery store with it.", verified: true, helpful: 7 },
      { name: "Elon Tusk", date: "2026-09-15", stars: 3, title: "Needs more", text: "Bright enough for the trail. I would want 10x the lumens.", verified: true, helpful: 1 },
    ],
    questions: [
      { q: "Does it take regular batteries?", a: "No. It has a built-in rechargeable battery that charges with the included USB-C cable.", by: "Seller", date: "2025-02-20", votes: 18 },
      { q: "Can you turn off the motion sensor?", a: "yes, the sensor is its own setting. if you don't turn it on the light just works with the button", by: "Silas", date: "2025-09-11", votes: 15 },
    ],
  },

  'mesa-trail-trekking-poles': {
    summary: "These poles are light, the cork handles stay comfortable on long hikes, and they take a lot of strain off the knees on steep downhills. They fold short enough for a suitcase. The lever locks loosen over time and need tightening, and a few people lost the rubber tips on the trail.",
    aspects: [
      { name: "Weight", good: 720, bad: 40 },
      { name: "Grips", good: 650, bad: 30 },
      { name: "Locks", good: 470, bad: 260 },
      { name: "Folded size", good: 390, bad: 70 },
      { name: "Value", good: 520, bad: 45 },
    ],
    reviews: [
      { name: "Stella R.", date: "2025-07-26", stars: 5, title: "My knees thank me", text: "I'm 4'11 and most poles don't go short enough for me, these do with a little room to spare. Did a 9 mile hike with about 2,000 ft of climbing and coming down was a huge difference. Normally my knees hurt for two days after and this time barely at all. Cork handles were comfortable even with sweaty hands, and there's a foam part under the handle so you can grip lower on the steep parts. They fold small enough to strap on the side of my daypack when I'm not using them", verified: true, helpful: 88 },
      { name: "Tariq H.", date: "2026-05-30", stars: 2, title: "Pole collapsed going downhill", text: "Halfway down a rocky section one pole slipped shorter and I almost went over. Later found out there's a little knob on each lever you have to tighten. Nothing in the box made that obvious. Fine now but that was scary.", verified: true, helpful: 52 },
      { name: "Sergio T.", date: "2025-08-14", stars: 4, title: "Tighten the levers now and then", text: "Good poles for the price. Every few hikes I give the lever knobs a quarter turn because they loosen up a little.", verified: true, helpful: 19 },
      { name: "Vivian C.", date: "2026-04-09", stars: 5, title: "Help with my balance", text: "I'm 68 and use these on the neighborhood trails with the rubber tips on. I feel much steadier, especially on gravel.", verified: true, helpful: 23 },
      { name: "Saul G.", date: "2026-06-18", stars: 4, title: "Rubber tips pop off", text: "Lost one of the rubber tips somewhere on the trail. They come off pretty easy on rocks. Poles themselves are great.", verified: true, helpful: 11 },
      { name: "Tanner J.", date: "2026-03-15", stars: 5, title: "Cork grips", text: "The cork grips are really nice in hot weather", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "What heights do these work for?", a: "They adjust from 39 to 53 inches, which fits hikers from about 4 ft 10 in to 6 ft 4 in.", by: "Seller", date: "2026-03-22", votes: 21 },
      { q: "Is it one pole or two?", a: "you get two", by: "Winston", date: "2026-09-06", votes: 12 },
    ],
  },

  'foxglove-cork-yoga-blocks': {
    summary: "The cork blocks are firm and steady, don't slide on a mat or a wood floor, and feel nicer in the hand than foam. Getting two in the pack is a plus. They're heavier than expected and shed bits of cork at first, and a few chipped at a corner when dropped.",
    aspects: [
      { name: "Stability", good: 640, bad: 20 },
      { name: "Grip", good: 520, bad: 35 },
      { name: "Weight", good: 310, bad: 150 },
      { name: "Shedding", good: 40, bad: 210 },
    ],
    reviews: [
      { name: "Sienna D.", date: "2026-05-12", stars: 5, title: "So much better than foam", text: "Used squishy foam blocks for years and didn't realize how much they wobble until I got these. In half moon I can actually lean on the block and it doesn't move. I do hot yoga 3x a week and my hands get super sweaty and these still don't slip. I put both under my back for supported bridge at the end of class. They are heavy to lug to the studio so they just live in my car now", verified: true, helpful: 47 },
      { name: "Tre W.", date: "2026-08-07", stars: 3, title: "Crumbs everywhere at first", text: "For the first couple of weeks they left little bits of cork all over my mat. It did stop eventually but it was annoying.", verified: true, helpful: 19 },
      { name: "Yara D.", date: "2026-03-29", stars: 5, title: "Steady", text: "Very steady, zero wobble.", verified: true, helpful: 4 },
      { name: "Usha N.", date: "2026-06-25", stars: 4, title: "Heavy to carry", text: "Great at home. Heavy to bring to class, the two together are over 3 pounds.", verified: true, helpful: 9 },
      { name: "Shelby A.", date: "2026-09-19", stars: 5, title: "Good for physical therapy", text: "My physical therapist had me get blocks for stretches after my knee surgery. These don't slide around on my wood floor, which is a big deal when you're already unsteady", verified: true, helpful: 14 },
      { name: "Toni M.", date: "2026-04-16", stars: 5, title: "Smells like a wine cork", text: "Faint woody smell for the first week, now nothing. Very grippy.", verified: true, helpful: 3 },
      { name: "Vance P.", date: "2026-07-21", stars: 2, title: "Corner broke off", text: "Dropped one off the bench onto the tile and a chunk of the corner broke off. Still usable but I expected it to be tougher.", verified: true, helpful: 12 },
      { name: "yogi_vee", date: "2026-10-11", stars: 5, title: "love these", text: "love these, use them every day", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Are these heavier than foam blocks?", a: "Yes. Each cork block weighs about 1.6 lb, which is heavier than most foam blocks and helps it stay steady.", by: "Seller", date: "2026-03-10", votes: 14 },
    ],
  },

  'book-weeknight-pantry': {
    summary: "Home cooks say the recipes are quick and clearly written, and a photo of every dish helps. Lots of them cook from it several nights a week. A number of recipes call for things most pantries don't have, like miso or tahini, and a few say 30 minutes is optimistic once you count the chopping.",
    aspects: [
      { name: "Recipes", good: 520, bad: 60 },
      { name: "Ease", good: 480, bad: 70 },
      { name: "Photos", good: 390, bad: 15 },
      { name: "Ingredients", good: 190, bad: 160 },
    ],
    reviews: [
      { name: "Sol Ramirez", date: "2026-04-03", stars: 5, title: "The book I actually cook from", text: "I have a whole shelf of cookbooks I've made maybe two things from. This one I've made over 20 recipes from since March. Two kids and I usually get home around 6:30 so the 30 minute stuff is the only stuff that happens on a weeknight. The white bean and sausage soup is a weekly thing now and somehow the chickpea skillet with eggs is my kids' favorite?? The swaps at the bottom of each recipe have saved me more than once when I was out of lemons or didn't have fresh herbs", verified: true, helpful: 71 },
      { name: "Talia N.", date: "2026-06-17", stars: 3, title: "Not what's in MY pantry", text: "The title says from what you already have, but a lot of recipes want miso, tahini, fish sauce or preserved lemons. Maybe some people keep those around, I don't. The ones I could make were good.", verified: true, helpful: 38 },
      { name: "Warren B.", date: "2026-06-29", stars: 5, title: "Works for cooking for one", text: "Most recipes are for 4 but they're easy to cut in half. I live alone and this got me out of the takeout habit.", verified: true, helpful: 16 },
      { name: "Shauna P.", date: "2026-08-29", stars: 4, title: "Lots of vegetarian", text: "I love that so many are vegetarian, my husband wanted more meat dishes. The ones with canned fish surprised us both, really good.", verified: true, helpful: 9 },
      { name: "Ximena R.", date: "2026-05-21", stars: 5, title: "Photos help a new cook", text: "I'm pretty new to cooking and seeing a photo of what it should look like at the end helps a lot.", verified: true, helpful: 12 },
      { name: "Vern O.", date: "2026-09-08", stars: 4, title: "30 minutes is optimistic", text: "Good recipes but with chopping it's more like 40 to 45 minutes for me. Still easy.", verified: true, helpful: 14 },
      { name: "Zainab O.", date: "2026-07-13", stars: 5, title: "Gave it to my daughter", text: "Bought it for my daughter when she moved into her first apartment. She texts me pictures of what she makes.", verified: true, helpful: 5 },
      { name: "tinykitchen_tom", date: "2026-10-04", stars: 5, title: "good weeknight book", text: "simple, tasty, not a lot of dishes to wash", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Are there gluten-free recipes?", a: "Yes. Many recipes are gluten free or have a gluten-free swap, and they are marked in the book.", by: "Seller", date: "2026-03-14", votes: 13 },
      { q: "Does it list calories or nutrition?", a: "no nutrition info, just servings and prep and cook times", by: "Talia", date: "2026-06-20", votes: 8 },
      { q: "Is it all vegetarian?", a: "about half I'd say. the rest have chicken, sausage or canned fish", by: "Shauna", date: "2026-09-01", votes: 5 },
    ],
  },

  'book-little-fox-moon': {
    summary: "Parents love the watercolor pictures and the rhymes, which are easy to read aloud, and the calm ending suits bedtime. Kids ask for it every night and hunt for the hidden animals on each page. Some think it's very short for the price, and a few found a couple of the rhymes a little forced.",
    aspects: [
      { name: "Illustrations", good: 980, bad: 25 },
      { name: "Bedtime", good: 640, bad: 20 },
      { name: "Story", good: 760, bad: 60 },
      { name: "Length", good: 210, bad: 240 },
    ],
    reviews: [
      { name: "Tiana S.", date: "2026-03-11", stars: 5, title: "Every single night for two months", text: "My daughter is 3 and this has been her bedtime book every night since her birthday, I have it memorized by now. She has to find the fireflies on every page before I'm allowed to turn it and she whispers the last line with me. The pictures are soft and kind of glowy. A lot of kids books are so loud and busy and I think that's why this one actually calms her down. Some other bedtime books we tried just wind her up", verified: true, helpful: 54 },
      { name: "Stuart M.", date: "2026-07-01", stars: 3, title: "Very short", text: "Lovely pictures but it takes about 4 minutes to read the whole thing. For 13 dollars I expected a little more story.", verified: true, helpful: 29 },
      { name: "Veronica L.", date: "2026-05-26", stars: 5, title: "Grandma approved", text: "I bought two, one for my grandson and one for me, so I can read it to him over video call and he follows along with his copy.", verified: false, helpful: 21 },
      { name: "Thalia G.", date: "2026-09-21", stars: 4, title: "A couple rhymes don't work", text: "Mostly reads really nicely out loud, but two or three pages the rhyme feels forced. My son doesn't care at all.", verified: false, helpful: 7 },
      { name: "Yusuf A.", date: "2026-08-12", stars: 5, title: "Calms him down", text: "Our wind down book. Works on my 4 year old.", verified: false, helpful: 5 },
      { name: "Whitney G.", date: "2025-06-18", stars: 5, title: "Pages hold up", text: "My toddler chewed a corner and spilled juice on it and the pages just wiped off. Thicker paper than most picture books", verified: true, helpful: 8 },
      { name: "Sasha V.", date: "2026-02-19", stars: 5, title: "Preschool story time", text: "I read it to my preschool class before nap. They love pointing out the owls.", verified: true, helpful: 6 },
    ],
    questions: [
      { q: "Is it a board book?", a: "No. It is a hardcover picture book with thick paper pages, not board pages.", by: "Seller", date: "2025-03-05", votes: 15 },
      { q: "How long does it take to read?", a: "about 5 minutes, less if you skip looking for the animals", by: "Tiana", date: "2026-03-16", votes: 11 },
    ],
  },

  'book-salt-and-signal': {
    summary: "The island setting feels real and the storm chapters are hard to put down, readers say, and book clubs find plenty to talk about. Lots of people read the second half in one sitting. The first hundred pages are slow for some, and a few thought the ending was too neat.",
    aspects: [
      { name: "Setting", good: 1650, bad: 80 },
      { name: "Characters", good: 1320, bad: 190 },
      { name: "Ending", good: 980, bad: 260 },
      { name: "Pacing", good: 540, bad: 610 },
    ],
    reviews: [
      { name: "Sunita K.", date: "2026-06-06", stars: 5, title: "Push through the first 100 pages", text: "Almost gave up early on. It takes forever introducing the whole island and I wasn't sure where it was going. Then the storm hits and I read the last 250 pages in one Sunday. When she's alone at the radio trying to reach the mainland my heart was pounding. I grew up in a little coastal town and everyone knowing everyone's business and all the old grudges, that part was exactly right. Book club spent most of the night talking about the mother and what she kept from her kids", verified: true, helpful: 82 },
      { name: "Trina C.", date: "2026-04-22", stars: 2, title: "Too slow for me", text: "Gave up around page 150. Lots of description of fog and boats, not much happening. I know people say it picks up but I ran out of patience.", verified: true, helpful: 36 },
      { name: "Winona S.", date: "2025-07-15", stars: 5, title: "Good book club pick", text: "Picked it for our group and the questions in the back were actually useful. We could have talked for another hour.", verified: true, helpful: 24 },
      { name: "Selma J.", date: "2026-03-19", stars: 4, title: "Slow start, worth it", text: "First third is slow, the rest is great. The radio details are so specific you can tell the author did her homework.", verified: true, helpful: 15 },
      { name: "Viktor R.", date: "2026-09-27", stars: 3, title: "Ending too tidy", text: "Loved the setting and the storm. But everything gets wrapped up in the last 20 pages a little too neatly for me.", verified: true, helpful: 17 },
      { name: "Yvonne K.", date: "2026-07-04", stars: 5, title: "Couldn't put down the second half", text: "Stayed up til 2 am finishing it. Then read the afterword and cried again", verified: true, helpful: 9 },
      { name: "Skye", date: "2026-05-08", stars: 5, title: "The radio parts", text: "The radio parts were my favorite, I didn't know anything about that before.", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Is this the same story as the hardcover?", a: "Yes, the story is the same. The paperback adds a new afterword by the author.", by: "Seller", date: "2026-03-01", votes: 9 },
      { q: "Is it a romance?", a: "there's a love story in it but it's mostly about the family and the storm", by: "Winona", date: "2025-07-18", votes: 7 },
      { q: "Ok for a 14 year old?", a: "some swearing and a death, nothing graphic. i think 14 is fine", by: "Redbird Customer", date: "2026-06-12", votes: 3 },
    ],
  },

  'grocery-green-tea': {
    summary: "Brewed right, this tea is smooth and mild, and 100 bags for the price is good value. The separate wrappers keep it fresh, and plenty of people drink it every day at work. Water that's too hot or a bag left in too long makes it bitter, and a few find the flavor weak.",
    aspects: [
      { name: "Taste", good: 1250, bad: 210 },
      { name: "Value", good: 1100, bad: 40 },
      { name: "Freshness", good: 620, bad: 30 },
      { name: "Bitterness", good: 190, bad: 340 },
    ],
    reviews: [
      { name: "Sana Q.", date: "2026-05-15", stars: 5, title: "Bitter until I read the box", text: "First week I thought it was way too bitter and almost gave up. I was pouring boiling water right off the kettle and leaving the bag in while I worked. Box says 175 degrees for 2 to 3 minutes, so now I let the kettle sit a couple minutes and set a timer and it's a totally different tea. Smooth, a little grassy. Swapped my afternoon coffee for this and I think I'm sleeping better", verified: true, helpful: 63 },
      { name: "Vito B.", date: "2026-07-09", stars: 2, title: "Tastes like grass to me", text: "Even brewing it cooler, it just tastes like grass clippings to me. Probably I'm just not a green tea person. My wife likes it.", verified: true, helpful: 11 },
      { name: "Uri F.", date: "2025-02-23", stars: 5, title: "Good value", text: "100 bags for this price is hard to beat. Tastes as good as the expensive brand I used to buy.", verified: true, helpful: 9 },
      { name: "Sheila O.", date: "2025-07-26", stars: 4, title: "Mild", text: "On the weak side if you like strong tea. I use two bags in my big mug.", verified: true, helpful: 7 },
      { name: "Tomasz W.", date: "2025-02-08", stars: 5, title: "Wrapped bags are great for work", text: "Each bag is in its own foil packet so I keep a handful in my desk and my backpack and they don't go stale.", verified: true, helpful: 14 },
      { name: "Willa K.", date: "2026-06-30", stars: 5, title: "Makes good iced tea", text: "I brew 6 bags in a pitcher, let it cool and keep it in the fridge all week in summer.", verified: true, helpful: 5 },
      { name: "Sydney F.", date: "2026-09-16", stars: 3, title: "Box showed up crushed", text: "Box was smashed when it got here and a few of the foil packets had split open. The tea itself is fine.", verified: true, helpful: 4 },
    ],
    questions: [
      { q: "How much caffeine is in it?", a: "About 30 mg per cup, which is roughly a third of a cup of coffee.", by: "Seller", date: "2025-02-27", votes: 17 },
    ],
  },

  'meadowmill-almond-butter': {
    summary: "Smooth, tastes like roasted almonds and never needs stirring. The complaints are the palm oil and how fast a jar goes for the price.",
    aspects: [
      { name: "Taste", good: 1080, bad: 120 },
      { name: "Texture", good: 940, bad: 70 },
      { name: "No stirring", good: 760, bad: 25 },
      { name: "Ingredients", good: 310, bad: 380 },
    ],
    reviews: [
      { name: "Sabine T.", date: "2026-04-27", stars: 5, title: "No more stirring with a knife", text: "I have arthritis in my hands and stirring the natural kind with the oil puddle on top actually hurt, it's like stirring wet cement. This one is smooth right out of the jar every time, even near the bottom. Tastes like roasted almonds and isn't sweet. In my oatmeal every morning and on apple slices in the afternoon. And the lid is easy to open too which I can't say for a lot of brands", verified: true, helpful: 58 },
      { name: "Thaddeus R.", date: "2026-07-18", stars: 2, title: "Has palm oil", text: "Didn't notice until it showed up that it has palm oil in it. I wanted just almonds and salt. Tastes fine but I won't buy it again.", verified: true, helpful: 33 },
      { name: "Vera L.", date: "2026-03-06", stars: 5, title: "So smooth", text: "Smoothest almond butter I've had. Spreads on soft bread without tearing it.", verified: true, helpful: 9 },
      { name: "Wade H.", date: "2026-09-04", stars: 4, title: "Goes fast", text: "good stuff but a 16 oz jar lasts about a week in my house. wish they had a bigger jar", verified: true, helpful: 6 },
      { name: "Zara L.", date: "2026-06-13", stars: 5, title: "Smoothie staple", text: "A spoonful in my morning smoothie with a banana. Blends in easily, no gritty bits.", verified: true, helpful: 4 },
      { name: "Sid P.", date: "2026-08-23", stars: 3, title: "Saltier than I expected", text: "A little salty for me. My kids like it fine on sandwiches.", verified: true, helpful: 5 },
      { name: "Marissa Mayo", date: "2026-02-16", stars: 5, title: "Yahoo", text: "Yahoo! Finally one that stays mixed. Better than mayo on a sandwich lol", verified: true, helpful: 2 },
      { name: "veganvicky", date: "2025-10-01", stars: 5, title: "no oil puddle", text: "finally no oil puddle on top. tastes great", verified: true, helpful: 1 },
    ],
    questions: [
      { q: "Is it made in a peanut-free facility?", a: "No. It is made in a facility that also processes peanuts.", by: "Seller", date: "2026-03-12", votes: 19 },
      { q: "Does it need to go in the fridge?", a: "no, i keep mine in the cupboard and it stays soft", by: "Vera", date: "2026-03-14", votes: 7 },
    ],
  },

  'cobble-shape-sorter': {
    summary: "It's solid wood with bright colors, and toddlers stay busy with it for a long time. Some say it helped their kids learn the names of shapes and colors. It's too easy for kids past 3, and a few found the lid hard for small hands to lift off.",
    aspects: [
      { name: "Quality", good: 520, bad: 30 },
      { name: "Learning", good: 440, bad: 25 },
      { name: "Paint", good: 260, bad: 45 },
      { name: "Difficulty", good: 190, bad: 140 },
    ],
    reviews: [
      { name: "Serena V.", date: "2026-06-02", stars: 5, title: "He says triangle now", text: "Got this for our son's 2nd birthday. First week he mostly dumped the shapes out and banged them together, which is fine. Now a couple months later he can do all of them by himself except the star, and he says circle and triangle when he drops them in. First time he's said those words! The wood is heavy and smooth and the paint hasn't chipped even with him throwing the pieces. He goes back to it more than any of his other toys", verified: true, helpful: 39 },
      { name: "Tamara J.", date: "2026-08-10", stars: 3, title: "Too easy for my 3 and a half year old", text: "She figured it out in one afternoon and hasn't touched it since. Would be better for a younger 2 year old.", verified: true, helpful: 17 },
      { name: "Wynn D.", date: "2026-04-05", stars: 5, title: "Grandkids fight over it", text: "Keep it at our house for the grandkids. The two youngest fight over who gets to do it.", verified: true, helpful: 6 },
      { name: "Vada M.", date: "2025-11-22", stars: 4, title: "Lid is snug", text: "My 2 year old can't lift the lid off by herself yet, she brings it to me. Otherwise great.", verified: true, helpful: 8 },
      { name: "Ulrike S.", date: "2026-03-18", stars: 5, title: "Paint holds up", text: "Five months of being banged on the floor and chewed and no paint coming off.", verified: true, helpful: 7 },
      { name: "Seth N.", date: "2026-07-14", stars: 2, title: "The star sticks", text: "The star shape is a really tight fit in its hole and gets stuck, which makes my son so mad he throws it. I sanded it down a little and it's better.", verified: true, helpful: 21 },
    ],
    questions: [
      { q: "What shapes come with it?", a: "There are 15 pieces: circles, squares, triangles, rectangles and stars, three of each, in five colors.", by: "Seller", date: "2026-03-09", votes: 9 },
      { q: "Does the paint come off if they chew it?", a: "my son chews everything and it hasn't come off", by: "Ulrike", date: "2026-03-21", votes: 6 },
    ],
  },

  'pinwheel-hedgerow-game': {
    summary: "After one game it's easy to pick up, and it's short enough for a school night. Reviewers love the art and the wooden animals, and plenty of families play it every week. The rulebook is confusing on the first read, setup takes a while, and a few adult game groups found it too simple.",
    aspects: [
      { name: "Fun", good: 720, bad: 50 },
      { name: "Artwork", good: 610, bad: 15 },
      { name: "Components", good: 480, bad: 40 },
      { name: "Replay value", good: 400, bad: 70 },
      { name: "Rules", good: 230, bad: 260 },
    ],
    reviews: [
      { name: "Sylvie P.", date: "2026-02-22", stars: 5, title: "Our new Friday night game", text: "First game was rough. The rulebook explains scoring in a weird order and we had to start over once when we realized we were placing the hedge tiles wrong. Second game took 30 minutes and everyone got it. Now it's every Friday, me, my husband, our 9 and 12 year old and sometimes my parents when they visit. The 9 year old wins a lot and she LOVES that. The little wooden hedgehogs are so cute and the insert in the box keeps everything sorted", verified: true, helpful: 49 },
      { name: "Tobin H.", date: "2026-05-16", stars: 2, title: "Rulebook is a mess", text: "Spent 40 minutes setting up and reading and still weren't sure how the animal scoring worked. Ended up looking for answers online. The game might be good but the rulebook needs a rewrite.", verified: true, helpful: 31 },
      { name: "Wendell F.", date: "2026-08-04", stars: 4, title: "Good with two", text: "My wife and I play it with just the two of us and it works well. Wish there were a few more animal types.", verified: false, helpful: 9 },
      { name: "Yuri D.", date: "2026-06-27", stars: 5, title: "Wooden animals", text: "The wooden animals and the art on the tiles are really nice. Feels like a much more expensive game.", verified: false, helpful: 7 },
      { name: "Sloane E.", date: "2026-09-11", stars: 3, title: "Too simple for our group", text: "Our adult game group played it once and thought it was too light. Better as a family game, which I guess is what it says.", verified: false, helpful: 12 },
      { name: "Zeke M.", date: "2026-07-19", stars: 5, title: "My kids ask for it", text: "My 8 and 10 year old ask to play this instead of video games. That says it all.", verified: true, helpful: 10 },
    ],
    questions: [
      { q: "Can a 6 year old play?", a: "my 6 year old plays the co-op version with some help. the regular game is better at 8", by: "Zeke", date: "2026-07-24", votes: 10 },
      { q: "How long does setup take?", a: "5 to 10 minutes once you know it. the first time took us way longer", by: "Sylvie", date: "2026-03-01", votes: 8 },
    ],
  },
};
