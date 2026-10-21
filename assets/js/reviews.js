// Made-up customer reviews and questions for every Redbird product. All people and text are invented.
//
// Shape per product id:
//   summary    the "Customers say" box: what most buyers like, what some complain about
//   aspects    things buyers mention, with counts of positive (good) and negative (bad) mentions
//   reviews    8 reviews. variant only on products with swatches or sizes.
//              photo (0 or 1) means the review shows customer photo #0 or #1.
//   questions  3 shopper questions with answers
window.RB_REVIEWS = {
  // ── Chargers ─────────────────────────────────────────────────────────────
  'rb-20w-usbc-charger': {
    summary: "Customers say this charger is small, charges phones quickly, and the folding plug makes it easy to carry in a pocket or bag. Many keep a spare by the bed or in a travel bag. Some say it gets warm while charging, and a few had one stop working after a few months.",
    aspects: [
      { name: "Charging speed", good: 2140, bad: 176 },
      { name: "Size", good: 1630, bad: 42 },
      { name: "Folding plug", good: 905, bad: 31 },
      { name: "Durability", good: 610, bad: 233 },
      { name: "Heat", good: 120, bad: 298 },
    ],
    reviews: [
      { name: "Denise W.", date: "2026-05-08", stars: 5, title: "Finally a charger that stays in hotel outlets", text: "I travel for work almost every week and I'm tired of bulky chargers that fall out of hotel outlets. This one is about the size of a big ice cube and stays put even in the loose outlets behind hotel nightstands. It charged my Pixel 8 and my iPad mini fine, the iPad is slower obviously but it gets there. The folding prongs are the best part honestly, nothing poking holes in my bag lining anymore. I've had it about 5 months now with no issues. Only small thing is the little light on it is kind of bright if it's next to the bed, I put a piece of tape over it.", verified: true, helpful: 287 },
      { name: "Priya K.", date: "2026-09-14", stars: 5, title: "Small and actually fast", text: "Charges my iPhone 15 from about 10% to a little over half in the time it takes me to shower and get dressed. Plug folds in so I just toss it in my work bag.", verified: true, helpful: 23, photo: 0 },
      { name: "mike_in_oakland", date: "2026-07-02", stars: 5, title: "bought 3", text: "bought one, liked it, went back and got two more. one for the car bag one for my desk one for the kitchen. no complaints", verified: true, helpful: 11 },
      { name: "Tomás R.", date: "2026-03-19", stars: 4, title: "Works, gets a little warm", text: "Does what it says. It gets warm when charging my Galaxy S23 but never hot enough to worry me. Took off a star because standard shipping took 7 days.", verified: true, helpful: 14 },
      { name: "Grace Liu", date: "2026-08-27", stars: 5, title: "Sent two with my kid to college", text: "Sent my daughter to her dorm with two of these. She says they're the only thing she hasn't lost yet lol", verified: true, helpful: 4 },
      { name: "Jamal Pierce", date: "2026-06-11", stars: 4, title: "Not quite 50% in 30 min for me", text: "With my iPhone 13 it was more like 40-45% in half an hour. Still way faster than the old tiny cube I was using before. Nice and small.", verified: true, helpful: 9 },
      { name: "Curtis L.", date: "2026-09-30", stars: 2, title: "Died after 3 months", text: "Worked great until it didn't. Around 3 months in it started cutting in and out and now it doesnt charge at all. Tried different cables and outlets, it's the charger. Support is sending a replacement so we'll see.", verified: true, helpful: 38 },
      { name: "K. Tran", date: "2026-04-22", stars: 5, title: "Does the job", text: "Great little charger. Fits behind the couch outlet", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Does this work with a Pixel 9?", a: "yes, mine charges fine. it shows fast charging on the lock screen too", by: "Aaron", date: "2026-07-19", votes: 14 },
      { q: "Does it come with a cable?", a: "No, the box includes the charger only. You will need a USB-C cable, which is sold separately.", by: "Seller", date: "2026-05-02", votes: 22 },
      { q: "Can I use it in Europe?", a: "It works on 100-240V so the charger itself is fine, but you need a plug adapter since the prongs are US style.", by: "Redbird Customer", date: "2026-04-11", votes: 8 },
    ],
  },

  'voltedge-20w-usbc': {
    summary: "Customers say the charger works well once it arrives and charges phones at a normal fast speed. Many are frustrated by shipping, which often takes two to four weeks because it ships from overseas. Some say the glossy black finish scratches easily and shows fingerprints.",
    aspects: [
      { name: "Shipping time", good: 41, bad: 312 },
      { name: "Charging speed", good: 288, bad: 36 },
      { name: "Finish", good: 52, bad: 97 },
      { name: "Value", good: 140, bad: 88 },
    ],
    reviews: [
      { name: "Brandon S.", date: "2026-06-03", stars: 1, title: "Took 23 days to arrive", text: "Ordered this when my old charger broke thinking it'd be here in a few days. It said ships from overseas but I didn't notice that part. 23 days later it showed up. I had already bought another one at the drugstore by then. Charger works I guess but I would not order it again.", verified: true, helpful: 41 },
      { name: "Lucia M.", date: "2026-04-28", stars: 4, title: "Fine charger, slow shipping", text: "Works fine with my iPhone 16. Took almost 3 weeks to get here so plan ahead", verified: true, helpful: 17 },
      { name: "Raj Patel", date: "2026-08-15", stars: 5, title: "Good once it got here", text: "The tracking didn't update for like 10 days and I definately thought it was lost, then it just showed up. Charges fast, no heat issues. The shiny black looks nice on my desk.", verified: true, helpful: 6 },
      { name: "sandy_b", date: "2026-07-21", stars: 2, title: "scratches easy", text: "the glossy finish got scratched up in my purse within a week and it's a fingerprint magnet. charges ok. also took 18 days", verified: true, helpful: 9 },
      { name: "Owen Gallagher", date: "2026-03-09", stars: 5, title: "Fast charges my Galaxy", text: "My Galaxy A54 says Fast charging on the lock screen with this. Long wait for shipping but I wanted a black one and this was the only black one I liked.", verified: true, helpful: 3 },
      { name: "Hana Yoshida", date: "2026-09-02", stars: 3, title: "It's ok", text: "It's ok. Nothing special, and it cost more than the Redbird Basics one which I didn't see until after. Box showed up a little crushed from the long trip but the charger inside was fine.", verified: true, helpful: 12 },
      { name: "Redbird Customer", date: "2026-05-17", stars: 4, title: "Does the job", text: "Charges my phone and my kid's tablet. Shipping was slow, about 2 and a half weeks.", verified: true, helpful: 0 },
      { name: "Ade O.", date: "2026-10-04", stars: 5, title: "no complaints", text: "Good charger. I knew it was coming from overseas going in so the wait didn't bother me", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "How long does shipping actually take?", a: "Mine took 16 days to California.", by: "Lucia", date: "2026-05-01", votes: 31 },
      { q: "Is this as fast as other 20W chargers?", a: "Yes. It supports PD fast charging at up to 20 W, the same as other 20 W USB-C chargers.", by: "Seller", date: "2026-03-22", votes: 7 },
      { q: "Do the prongs fold?", a: "no they're fixed, they don't fold", by: "Redbird Customer", date: "2026-08-09", votes: 5 },
    ],
  },

  'chargemate-20w-lightning': {
    summary: "Customers say the long 6-foot cable attached to the charger is the best part, since it easily reaches from the wall to a bed or couch. Many say it charges older iPhones quickly. Several buyers were disappointed to find the cable ends in a Lightning plug, which does not fit newer USB-C iPhones or Android phones.",
    aspects: [
      { name: "Cable length", good: 1180, bad: 64 },
      { name: "Charging speed", good: 870, bad: 92 },
      { name: "Connector type", good: 210, bad: 640 },
      { name: "Build quality", good: 430, bad: 150 },
    ],
    reviews: [
      { name: "Carla J.", date: "2026-03-27", stars: 1, title: "It's LIGHTNING not USB-C", text: "The title says USB C right there and I bought it for my iPhone 16. It's a Lightning cable. It does not fit. Apparently the USB C part is inside the block?? Which you can't even use because the cable is built in. Returned.", verified: true, helpful: 156 },
      { name: "Walt H.", date: "2026-06-19", stars: 5, title: "Long cord is great", text: "I'm 74 and have an iPhone 12 that I'm not replacing anytime soon. The 6 foot cord reaches from the outlet behind the nightstand all the way to my recliner. Charges fast.", verified: true, helpful: 33 },
      { name: "Nicole A.", date: "2026-08-04", stars: 5, title: "Perfect for my son's old iPad", text: "Bought for my son's older iPad that still uses Lightning. Love that the cable is attached so he can't lose it.", verified: true, helpful: 8 },
      { name: "dev.r", date: "2026-05-12", stars: 4, title: "good but cable is stiff", text: "cable is long and seems tough but it's kind of stiff and keeps the coils from the packaging. charges my iphone 11 fast", verified: true, helpful: 4 },
      { name: "Ben Okafor", date: "2026-09-08", stars: 4, title: "Read the listing carefully", text: "Works great for my iPhone 14 but heads up to anyone with a 15 or 16, this will not fit your phone. I almost bought one for my wife too before I realized her phone is USB-C.", verified: true, helpful: 64 },
      { name: "Bonnie G.", date: "2026-07-30", stars: 2, title: "Cable frayed at the plug", text: "Cable started splitting right where it goes into the Lightning end after about 4 months. You can't replace just the cable since it's built in, so the whole thing is trash now.", verified: true, helpful: 27 },
      { name: "Marisol V.", date: "2026-02-16", stars: 5, title: "Exactly what I needed", text: "Lightning, built in cable, 20W. My iPhone 13 goes from almost dead to about half in a half hour. Came in 2 days.", verified: true, helpful: 2 },
      { name: "Tina", date: "2026-10-01", stars: 5, title: "Love it", text: "love the long cord", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Will this work with iPhone 15?", a: "No. iPhone 15 and newer use USB-C. This charger has a Lightning plug, which fits iPhone 14 and older.", by: "Seller", date: "2026-04-03", votes: 89 },
      { q: "Can you unplug the cable from the block?", a: "no it's attached for good", by: "Jordan", date: "2026-06-25", votes: 20 },
      { q: "Is it long enough to reach a bed from the wall?", a: "6 ft, it reaches my bed from an outlet about 4 feet away with slack left over", by: "Redbird Customer", date: "2026-08-18", votes: 7 },
    ],
  },

  'kestrel-65w-gan': {
    summary: "Customers say this charger is strong enough to charge a laptop while also charging a phone, and many use it to replace several chargers when they travel. Buyers like that it's much smaller than a typical laptop charger. Some say it gets warm with all three ports in use and that its width can block the other outlet.",
    aspects: [
      { name: "Laptop charging", good: 1560, bad: 48 },
      { name: "Multiple ports", good: 1220, bad: 37 },
      { name: "Size", good: 980, bad: 155 },
      { name: "Heat", good: 90, bad: 140 },
    ],
    reviews: [
      { name: "Eli Brennan", date: "2026-04-14", stars: 5, title: "Replaced 3 chargers in my backpack", text: "I used to carry my laptop brick, a phone charger and a separate one for my earbuds. Now it's just this. It charges my MacBook Air at full speed and my phone on the second USB-C port at the same time. I plugged the earbuds into the USB-A one with an old cable. Took it on a 10 day trip to Chicago and Denver and it was the only charger I brought. It's a little heavier than a phone charger but way smaller than the laptop brick.", verified: true, helpful: 121, photo: 0 },
      { name: "Fatima Z.", date: "2026-06-30", stars: 5, title: "Charges my work laptop", text: "Works with my Dell work laptop over USB-C. IT said it needs 65W and it charges fine.", verified: true, helpful: 21 },
      { name: "Greg T.", date: "2026-08-22", stars: 3, title: "Blocks the other outlet", text: "Charger is great, no problems with charging. But it's wide enough that it covers the other outlet on my wall plate, so now I need a little extension cord. Wish it was thinner.", verified: true, helpful: 18 },
      { name: "Sophie N.", date: "2026-03-05", stars: 5, title: "small for 65W", text: "smaller than I expected for a laptop charger. fits in the zipper pocket of my laptop sleeve", verified: true, helpful: 5 },
      { name: "Kwame A.", date: "2026-07-16", stars: 4, title: "Gets warm with everything plugged in", text: "With the laptop, phone and watch all going it gets pretty warm. Not too hot to touch but warm. With just the laptop it's fine.", verified: true, helpful: 12 },
      { name: "Marcus D.", date: "2026-09-21", stars: 5, title: "Note about the power split", text: "Just so people know, when you plug in more than one thing the 65W gets split up, so the laptop charges a bit slower if your phone is plugged in too. Expected, and still fast enough for me.", verified: true, helpful: 46 },
      { name: "Lena Fischer", date: "2026-05-27", stars: 5, title: "Good for a shared desk", text: "My husband and I share a desk and this charges both our phones and my laptop off one outlet. Going on 6 months with no problems", verified: true, helpful: 7 },
      { name: "Redbird Customer", date: "2026-10-09", stars: 5, title: "Great", text: "Works great. Fast.", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Will this charge a 16 inch MacBook Pro?", a: "It will, but slower than the charger that came with it, and it can lose battery if you're doing something heavy. Fine overnight.", by: "Eli", date: "2026-05-10", votes: 37 },
      { q: "Does the plug fold?", a: "Yes. The prongs fold flat into the charger.", by: "Seller", date: "2026-03-18", votes: 19 },
      { q: "Can I charge two laptops at once?", a: "you can plug in two but the power gets split so both charge pretty slow. one laptop plus a phone is the sweet spot", by: "Redbird Customer", date: "2026-08-01", votes: 11 },
    ],
  },

  'kestrel-30w-dual': {
    summary: "Customers say the slim, flat shape fits behind furniture and in tight spots where bulky chargers don't. Many use the two ports to charge a phone and earbuds or a watch at the same time. Some say charging slows down when both ports are in use, and a few found it slips out of older, looser outlets.",
    aspects: [
      { name: "Slim design", good: 620, bad: 18 },
      { name: "Two ports", good: 540, bad: 35 },
      { name: "Charging speed", good: 410, bad: 96 },
      { name: "Fit in outlet", good: 150, bad: 72 },
    ],
    reviews: [
      { name: "Hector Ruiz", date: "2026-05-04", stars: 5, title: "Fits behind my bed", text: "My bed is pushed right up against the outlet and nothing else fit back there. This one is flat enough that the headboard doesn't push it out. Charges my phone and earbuds overnight.", verified: true, helpful: 52 },
      { name: "Yuki T.", date: "2026-09-11", stars: 5, title: "Got this when the Pebble 2-pack sold out", text: "Wanted the Pebble Power 2-pack but it went out of stock while I was checking out, so I got this instead. Glad I did honestly, two ports on one charger is more useful for me than two separate chargers.", verified: true, helpful: 14 },
      { name: "Ravi Iyer", date: "2026-07-07", stars: 3, title: "Slower when both are plugged in", text: "On its own it fast charges my Pixel. Plug in a second thing and it slows down a lot. 30W total split two ways isn't much. Ok for overnight, not for a quick top up.", verified: true, helpful: 29 },
      { name: "Jenna M.", date: "2026-03-29", stars: 5, title: "Phone + watch", text: "Phone on one port, watch on the other. Both full by morning. Matte finish is nice too, doesn't slide around.", verified: true, helpful: 6 },
      { name: "Marty K.", date: "2026-06-14", stars: 2, title: "Falls out of old outlets", text: "Our house is from the 60s and the outlets are loose. This thing is so light and flat it slides right out. Works fine in the newer outlets in the kitchen", verified: true, helpful: 15 },
      { name: "Amy C.", date: "2026-08-20", stars: 5, title: "Good travel charger", text: "Slim enough for the front pocket of my passport wallet. Took it to Mexico, same plugs as here, and charged my phone and Kindle every night.", verified: true, helpful: 3 },
      { name: "Darnell W.", date: "2026-04-25", stars: 4, title: "pretty good", text: "Pretty good charger. wish it came in white", verified: true, helpful: 1 },
      { name: "Patricia O.", date: "2026-10-12", stars: 5, title: "Works with both our phones", text: "Works well with my Galaxy and my husband's iPhone. We charge both off one outlet in the guest room.", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Can it fast charge two phones at the same time?", a: "Not both at full speed. With two devices connected, the 30 W is shared between the two ports.", by: "Seller", date: "2026-04-08", votes: 24 },
      { q: "How thick is it?", a: "about as thick as two phones stacked, maybe a little less", by: "Hector", date: "2026-05-20", votes: 9 },
      { q: "Does it work with Pixel 8?", a: "yes", by: "Redbird Customer", date: "2026-07-28", votes: 3 },
    ],
  },

  'pebble-20w-2pack': {
    summary: "Customers say getting two chargers in one pack is good value, and many keep one at home and one at work. Buyers like the small, rounded shape. A common complaint is that the pack goes out of stock often, sometimes in the middle of checkout, and a few say one of the two chargers stopped working early.",
    aspects: [
      { name: "Value", good: 1290, bad: 88 },
      { name: "Size and shape", good: 760, bad: 40 },
      { name: "Availability", good: 35, bad: 410 },
      { name: "Durability", good: 380, bad: 190 },
    ],
    reviews: [
      { name: "Stephanie L.", date: "2026-08-06", stars: 3, title: "Good chargers, impossible to buy", text: "This is the third time I've tried to get this. Twice it went out of stock while it was in my cart. Third time it finally went through. The chargers themselves are fine, nothing special. Just annoying.", verified: true, helpful: 77 },
      { name: "Chris Ng", date: "2026-05-15", stars: 5, title: "One for home one for the office", text: "Exactly what the listing says. One lives in my desk drawer at work now. Nice round shape, no sharp corners in my bag.", verified: true, helpful: 12, photo: 0 },
      { name: "Abby R.", date: "2026-07-12", stars: 5, title: "great deal when it's in stock", text: "grabbed it during the deal. if it says out of stock keep checking back, it comes back every few days", verified: true, helpful: 21 },
      { name: "Redbird Customer", date: "2026-09-19", stars: 1, title: "One of the two died in a month", text: "First one still works. The second one stopped after about 5 weeks, no light, nothing. So I basically paid 20 bucks for one charger", verified: true, helpful: 34 },
      { name: "Luis F.", date: "2026-03-13", stars: 4, title: "Fine", text: "They charge my phone fast. A little bigger than I pictured for something called pebble but still small.", verified: true, helpful: 3 },
      { name: "Mei Chen", date: "2026-06-08", stars: 5, title: "Split it with my mom", text: "Gave one to my mom and kept one. She likes that it's round and easy to hold onto when pulling it out of the wall.", verified: true, helpful: 9 },
      { name: "J. Alvarez", date: "2026-10-03", stars: 4, title: "Finally restocked", text: "Was out of stock for like two weeks. When it came back I bought two packs just in case. Charges my Galaxy fine.", verified: true, helpful: 6 },
      { name: "Tasha B.", date: "2026-04-30", stars: 5, title: "Love these", text: "Love these. Bought for the kids rooms", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Why is this always out of stock?", a: "We restock this item often, but it sells out quickly during deals. You can add it to a list to be told when it is back.", by: "Seller", date: "2026-07-14", votes: 44 },
      { q: "Do they come with cables?", a: "no, just the 2 chargers", by: "Chris", date: "2026-05-22", votes: 18 },
      { q: "Will it charge a Kindle?", a: "yes mine charges a Kindle fine with a usb c cable", by: "Redbird Customer", date: "2026-08-29", votes: 5 },
    ],
  },

  // ── More electronics ─────────────────────────────────────────────────────
  'rb-usbc-cable-6ft': {
    summary: "Customers say the cable is long enough to reach a bed or couch, doesn't tangle, and holds up well to daily use. Many buy several at once for different rooms. A few say the plug got loose over time, and some find 6 feet too long for a car.",
    aspects: [
      { name: "Length", good: 3820, bad: 210 },
      { name: "Durability", good: 2950, bad: 310 },
      { name: "Tangling", good: 1240, bad: 22 },
      { name: "Charging speed", good: 1610, bad: 95 },
      { name: "Value", good: 2100, bad: 40 },
    ],
    reviews: [
      { name: "Olivia P.", date: "2026-04-02", stars: 5, title: "6 ft is the right length", text: "Long enough to use my phone in bed while it charges. The braid doesn't get all twisted like my old cables.", verified: true, helpful: 18 },
      { name: "Andre M.", date: "2026-07-25", stars: 5, title: "Holding up great", text: "I've bought about 5 of these over time. The oldest one is 8 months old and gets yanked out of the wall by my dog regularly, still works.", verified: true, helpful: 31 },
      { name: "Sam Whitfield", date: "2026-05-30", stars: 5, title: "Charges my laptop too", text: "Using it with the Kestrel 65W and it charges my MacBook Air no problem. 60W max is plenty for that.", verified: true, helpful: 22 },
      { name: "Xavier N.", date: "2026-08-13", stars: 2, title: "Loose at the phone end", text: "After a couple months the plug end got loose and my phone stops charging if I move it. The second one I bought is fine so far.", verified: true, helpful: 14 },
      { name: "Isabel G.", date: "2026-03-08", stars: 4, title: "Too long for the car", text: "Great cable but 6 ft is too much in the car, it ends up all over the floor. Perfect for the bedroom though.", verified: true, helpful: 5 },
      { name: "nate", date: "2026-09-26", stars: 5, title: "works", text: "works fine. cheap. long.", verified: true, helpful: 0 },
      { name: "Wendy Park", date: "2026-06-21", stars: 5, title: "Bought for my dad", text: "My dad kept breaking the cord that came with his phone. Got him two of these and he hasn't complained once in 6 months, which for him is saying something.", verified: true, helpful: 9 },
      { name: "Farid H.", date: "2026-02-24", stars: 5, title: "Great for charging, slow for files", text: "Charging is great. Just know it's USB 2.0 for data so moving big videos off my phone to my laptop is slow. For charging it's perfect", verified: true, helpful: 26 },
    ],
    questions: [
      { q: "Will this charge an iPhone 15?", a: "yes, iPhone 15 and 16 are USB-C so it works", by: "Olivia", date: "2026-04-17", votes: 15 },
      { q: "Does it support fast charging on Galaxy phones?", a: "Yes. The cable carries up to 60 W, so it supports fast charging when used with a fast charger.", by: "Seller", date: "2026-06-05", votes: 10 },
      { q: "Can I transfer photos with it?", a: "yes but it's slow, usb 2 speed", by: "Redbird Customer", date: "2026-08-24", votes: 7 },
    ],
  },

  'kestrel-buds': {
    summary: "Customers say the noise cancelling works well on buses, trains and planes for the price, and the battery lasts close to the 8 hours listed. Many like that they stay in during workouts. Some say the fit is uncomfortable for smaller ears, the mic sounds muffled on calls, and a few had one earbud stop charging.",
    aspects: [
      { name: "Noise cancelling", good: 1880, bad: 260 },
      { name: "Battery life", good: 1420, bad: 150 },
      { name: "Sound quality", good: 1560, bad: 310 },
      { name: "Fit", good: 1090, bad: 420 },
      { name: "Microphone", good: 380, bad: 290 },
    ],
    reviews: [
      { name: "Bianca F.", date: "2026-05-19", stars: 5, title: "Great on the train", text: "I take a 50 minute train every morning and these block out most of the rumble and people talking. Not perfect but for 50 bucks I'm happy.", verified: true, helpful: 63 },
      { name: "Jordan Kim", date: "2026-03-16", stars: 4, title: "Good sound, fit is a little big", text: "Sound is good, bass is decent. The tips they come with were too big for me, switched to the small ones in the box and it's better but my ears still get sore after a couple hours.", verified: true, helpful: 18 },
      { name: "Danny V.", date: "2026-08-08", stars: 1, title: "Left earbud stopped charging", text: "After about 2 months the left one stopped charging in the case. Cleaned the contacts, nothing. Annoying because they were good until then.", verified: true, helpful: 41 },
      { name: "Tyler Moss", date: "2026-06-27", stars: 5, title: "My gym earbuds", text: "Use them at the gym 5 days a week, sweat all over them and they still work. They don't fall out on the treadmill", verified: true, helpful: 12 },
      { name: "Aisha N.", date: "2026-09-03", stars: 3, title: "Mic is bad for calls", text: "Fine for music. On calls people say I sound far away and muffled, especially outside. If you need them for work calls look for something with a better mic.", verified: true, helpful: 37 },
      { name: "Carlos E.", date: "2026-07-09", stars: 5, title: "Battery is legit", text: "Flew to Lisbon and used them the whole flight with noise cancelling on, got around 7 and a half hours before they died. Case recharged them in about an hour.", verified: true, helpful: 29 },
      { name: "M. O'Brien", date: "2026-04-21", stars: 4, title: "Case feels cheap", text: "Earbuds are good. The case lid feels flimsy and rattles a bit. hope it lasts", verified: true, helpful: 6 },
      { name: "Kelsey", date: "2026-10-07", stars: 5, title: "love them", text: "love them. bought a second pair for my husband", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Can you use just one earbud at a time?", a: "yes either one works by itself", by: "Tyler", date: "2026-07-03", votes: 21 },
      { q: "Do they work with Android?", a: "Yes. They connect over Bluetooth to Android phones, iPhones, tablets and laptops.", by: "Seller", date: "2026-04-12", votes: 9 },
      { q: "How long does the case take to charge?", a: "about 2 hours from empty for me", by: "Redbird Customer", date: "2026-08-30", votes: 6 },
    ],
  },

  'northloop-studio-headphones': {
    summary: "Customers say these headphones are comfortable for long listening thanks to the soft cushions, and the battery lasts for days. Many like that they fold flat for travel. Some say they get warm on the ears after a few hours, feel tight on larger heads, and that the Sand color stains easily.",
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
      { name: "Ivan P.", date: "2026-07-18", stars: 4, title: "Hot ears", text: "Good sound, nice bass, battery lasts forever. They do get warm after a couple hours, not great in summer.", verified: true, helpful: 9, variant: "Color: Midnight blue" },
      { name: "bigtony77", date: "2026-05-06", stars: 3, title: "Tight on big heads", text: "I have a big head and these squeeze even on the biggest setting. Fine for an hour, then I need a break", verified: true, helpful: 13, variant: "Color: Black" },
      { name: "Leah Goldberg", date: "2026-03-23", stars: 5, title: "Great for flights", text: "Fold flat into my backpack. Used them on a flight to Tokyo and the battery barely moved.", verified: true, helpful: 6, variant: "Color: Midnight blue" },
      { name: "Marco Bellini", date: "2026-09-17", stars: 5, title: "Nice color", text: "Midnight blue looks almost black in most light, which I like.", verified: true, helpful: 4, variant: "Color: Midnight blue" },
      { name: "Shreya B.", date: "2026-10-10", stars: 5, title: "Bought for my teenager", text: "My son wears them all day for gaming and homework, still going strong after 4 months.", verified: true, helpful: 2, variant: "Color: Sage" },
    ],
    questions: [
      { q: "Do these have noise cancelling?", a: "No. The cushions block some outside sound, but these do not have active noise cancelling.", by: "Seller", date: "2026-04-15", votes: 28 },
      { q: "Can you use them with a cable?", a: "i don't think so, mine didn't come with an aux cable", by: "Ivan", date: "2026-07-24", votes: 5 },
      { q: "Is the Sage color more green or gray?", a: "grayish green, kind of muted. not bright at all", by: "Naomi", date: "2026-06-29", votes: 11 },
    ],
  },

  'fernway-phone-case': {
    summary: "Customers say the case feels soft and grippy, fits their phone well, and protects it from everyday drops. Many like the color choices. Some say lighter colors like Sand and Sky blue get dirty over time and that the silicone picks up pocket lint.",
    aspects: [
      { name: "Fit", good: 2100, bad: 180 },
      { name: "Grip", good: 1650, bad: 90 },
      { name: "Protection", good: 1320, bad: 240 },
      { name: "Color", good: 1480, bad: 360 },
      { name: "Lint and dirt", good: 60, bad: 540 },
    ],
    reviews: [
      { name: "Grant H.", date: "2026-07-31", stars: 4, title: "Case is great, the color picker on the site is not", text: "I'm blind and use VoiceOver on my iPhone. The case itself is great, soft and grippy and it fits perfectly. My problem was ordering it. The color buttons on the product page just read as 'button' over and over with no color names, so I had no idea which one I was picking. I ended up asking my neighbor to come look at the screen with me. Got Charcoal, which is what I wanted. Would be 5 stars if I could have done it myself.", verified: true, helpful: 112, variant: "Color: Charcoal" },
      { name: "Emily S.", date: "2026-05-23", stars: 5, title: "Soft and grippy", text: "Feels so nice in my hand and doesn't slide off the arm of the couch anymore. Lavender is really pretty, a little more blue than the picture.", verified: true, helpful: 19, variant: "Color: Lavender", photo: 0 },
      { name: "Jorge M.", date: "2026-08-17", stars: 5, title: "survived a drop", text: "dropped my phone face down on concrete in a parking lot. the raised edge saved the screen. case has a scuff, phone is fine", verified: true, helpful: 44, variant: "Color: Charcoal" },
      { name: "Kristy A.", date: "2026-06-04", stars: 2, title: "Sand color got dirty", text: "Within 3 weeks the Sand had dark marks around the edges where my hand holds it. Cant wash it off. Get a darker color", verified: true, helpful: 27, variant: "Color: Sand" },
      { name: "Kayla P.", date: "2026-03-11", stars: 5, title: "Cardinal red is gorgeous", text: "Deep red, not orangey at all. Fits my iPhone 16 perfectly and the buttons are easy to press through it.", verified: true, helpful: 8, variant: "Color: Cardinal red" },
      { name: "Hyun-woo L.", date: "2026-09-25", stars: 4, title: "Lint magnet", text: "Love the feel but it picks up pocket lint like crazy. I wipe it off every couple days. Fit is perfect.", verified: true, helpful: 11, variant: "Color: Sage green" },
      { name: "Bea", date: "2026-04-18", stars: 5, title: "3rd one", text: "This is my 3rd one, I just switch colors when I get bored", verified: true, helpful: 3, variant: "Color: Sky blue" },
      { name: "Paul Westbrook", date: "2026-10-14", stars: 5, title: "Fits well", text: "Fits my phone well and covers the camera bump. Good price.", verified: true, helpful: 0, variant: "Color: Charcoal" },
    ],
    questions: [
      { q: "Will this fit the iPhone 16 Plus?", a: "No. This case fits 6.1-inch phones only, such as iPhone 16 and iPhone 15. The 16 Plus is larger.", by: "Seller", date: "2026-03-30", votes: 34 },
      { q: "Does it work with wireless charging?", a: "yes I charge through it every night no issues", by: "Emily", date: "2026-06-02", votes: 22 },
      { q: "Is the Sage green more green or gray?", a: "kind of a soft gray green, like dried herbs", by: "Redbird Customer", date: "2026-08-11", votes: 6 },
    ],
  },

  'pebble-10k-powerbank': {
    summary: "Customers say the power bank is thin and light enough to carry every day and charges a phone about twice. Many use it for travel, concerts and long days out. Some say it takes a long time to recharge itself, and a few had one stop holding a charge after a couple of months.",
    aspects: [
      { name: "Capacity", good: 1420, bad: 190 },
      { name: "Size", good: 1310, bad: 70 },
      { name: "Charging speed", good: 880, bad: 160 },
      { name: "Recharge time", good: 210, bad: 330 },
    ],
    reviews: [
      { name: "Zoe Hart", date: "2026-07-27", stars: 5, title: "Kept my phone alive at a 3 day festival", text: "3 days at a music festival and this kept my phone alive the whole time. Got about 2 full charges out of it each time before I recharged it at the charging tent by the campsite.", verified: true, helpful: 38 },
      { name: "Tim Ostrowski", date: "2026-04-05", stars: 5, title: "Thin", text: "Actually fits in my back jeans pocket. Heavier than it looks though.", verified: true, helpful: 6 },
      { name: "Wes T.", date: "2026-06-18", stars: 3, title: "Slow to recharge", text: "Takes about 5 hours to charge back up from empty with my 20w charger. Fine overnight, not great if you forgot to charge it.", verified: true, helpful: 22 },
      { name: "Gloria D.", date: "2026-09-06", stars: 1, title: "Stopped holding a charge", text: "Worked great for 2 months then it would go from full to dead in a day without me even using it. Returned it.", verified: true, helpful: 19 },
      { name: "Pedro C.", date: "2026-03-02", stars: 5, title: "One port is enough", text: "I worried one port would be annoying but it's simple, the same cable charges the bank and charges my phone.", verified: true, helpful: 4 },
      { name: "Ana Lucía B.", date: "2026-05-28", stars: 4, title: "Good for travel", text: "Brought it on a plane in my carry on no problem. Gets a little warm if I use my phone while it's charging from it.", verified: true, helpful: 8 },
      { name: "brian k", date: "2026-08-21", stars: 5, title: "good", text: "does what it says", verified: true, helpful: 0 },
      { name: "Shira Cohen", date: "2026-10-02", stars: 5, title: "Lives in my commute bag", text: "Keep it in my bag for the commute. Charges my Pixel from 20 to full with juice left over.", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Can I take this on a plane?", a: "Yes. At 10,000 mAh it is within airline limits for carry-on bags. Do not pack it in checked luggage.", by: "Seller", date: "2026-05-14", votes: 40 },
      { q: "How do you know how much battery is left?", a: "4 little dots on the side light up", by: "Zoe", date: "2026-08-03", votes: 7 },
      { q: "Can it charge two things at once?", a: "no only one port", by: "Redbird Customer", date: "2026-06-23", votes: 9 },
    ],
  },

  'lumen-orb-speaker': {
    summary: "Customers say the speaker sounds full for its size and the light ring clock is handy on a nightstand or kitchen counter. Many use it as an alarm clock and for music while cooking. Some say voice commands often misunderstand them, Wi-Fi setup was frustrating, and the light ring is too bright at night.",
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
      { name: "Hank Peterson", date: "2026-07-05", stars: 5, title: "Good alarm clock", text: "Replaced my old alarm clock. I can see the time on the light ring and tell it to snooze without opening my eyes.", verified: true, helpful: 21 },
      { name: "Chloe W.", date: "2026-08-28", stars: 2, title: "Light ring too bright", text: "I can't find a way to fully turn off the ring at night. It lights up the whole bedroom. Moved it to the kitchen.", verified: true, helpful: 33 },
      { name: "Isaac Bloom", date: "2026-06-12", stars: 3, title: "Doesn't understand me half the time", text: "Sound is good. But I ask it to play something and it plays something totally different, or it says sorry I didn't get that. My accent maybe? My wife has better luck with it.", verified: true, helpful: 28 },
      { name: "Linh Pham", date: "2026-09-15", stars: 5, title: "Nice in the bathroom", text: "Use it for music in the shower. Sound fills the whole room.", verified: true, helpful: 4 },
      { name: "R. Castillo", date: "2026-04-26", stars: 4, title: "good speaker, meh app", text: "speaker is good, the setup app is clunky. once its set up it's fine", verified: true, helpful: 9 },
      { name: "Joyce A.", date: "2026-10-06", stars: 5, title: "Got it for my mother", text: "My mom lives alone and uses it to ask the weather and play her old music. She likes it a lot. Setup was a bit of a pain, so set it up for them first if you're giving it as a gift.", verified: true, helpful: 11 },
    ],
    questions: [
      { q: "Can you turn off the light ring?", a: "you can dim it in the app but I couldn't get it fully off", by: "Chloe", date: "2026-09-01", votes: 30 },
      { q: "Does it need Wi-Fi or can it be just Bluetooth?", a: "It works as a Bluetooth speaker without Wi-Fi. Voice commands and the clock need Wi-Fi.", by: "Seller", date: "2026-04-20", votes: 18 },
      { q: "Does it have a battery?", a: "no it has to stay plugged in", by: "Redbird Customer", date: "2026-07-13", votes: 12 },
    ],
  },

  // ── Home & kitchen ───────────────────────────────────────────────────────
  'hearth-oak-kettle': {
    summary: "Customers say the kettle heats water quickly, holds the temperature they set, and the thin spout makes it easy to pour slowly for coffee. Many like the keep-warm setting for a second cup. Some say the lid is stiff and hard to open, and that 1 liter is small for more than two people.",
    aspects: [
      { name: "Temperature control", good: 690, bad: 38 },
      { name: "Pouring", good: 610, bad: 42 },
      { name: "Heating speed", good: 480, bad: 55 },
      { name: "Size", good: 140, bad: 120 },
      { name: "Lid", good: 60, bad: 180 },
    ],
    reviews: [
      { name: "Owen Marsh", date: "2026-04-07", stars: 5, title: "Boils in about 4 minutes", text: "A full liter takes about 4 minutes to boil, a bit less if I set it to 200 for coffee. The spout gives you a really slow, steady pour, which is the whole reason I got it. Keep warm is nice for a second cup.", verified: true, helpful: 61, variant: "Color: Matte black", photo: 0 },
      { name: "Barbara N.", date: "2026-06-22", stars: 3, title: "Lovely kettle, but the lid is hard for me", text: "I have arthritis in both hands and I struggle with the lid. You have to pull it straight up and it fits very snug. Some mornings I wedge a spoon under the edge to get it off. Everything else about it is wonderful. The temperature numbers are easy to read and the handle is comfortable to hold. If they made one with a hinged lid or a button I would buy it again in a heartbeat.", verified: true, helpful: 58, variant: "Color: Cream" },
      { name: "Kenji Watanabe", date: "2026-03-14", stars: 5, title: "Green tea at the right temp", text: "Finally I can make green tea at 175 without guessing. Holds the temperature exactly", verified: true, helpful: 19, variant: "Color: Sage" },
      { name: "Redbird Customer", date: "2026-08-10", stars: 4, title: "Small", text: "Great kettle but 1 liter is only enough for 2 big mugs, or one pour over and a tea. For my family of 4 I'm filling it twice.", verified: true, helpful: 14, variant: "Color: Matte black" },
      { name: "Sofia Andersson", date: "2026-05-03", stars: 5, title: "Cream color is beautiful", text: "Looks so nice on the counter. The cream is a soft off white, not yellow.", verified: true, helpful: 8, variant: "Color: Cream" },
      { name: "Will Duncan", date: "2026-09-09", stars: 5, title: "pour over guy approved", text: "been making pour over for years with a stovetop kettle. this is way more consistent. the display on the base is easy to read", verified: true, helpful: 23, variant: "Color: Matte black" },
      { name: "Priscilla M.", date: "2026-07-20", stars: 4, title: "Matte finish shows water spots", text: "Works perfectly. The matte black shows water spots and fingerprints so I wipe it down every day.", verified: true, helpful: 5, variant: "Color: Matte black" },
      { name: "ted", date: "2026-02-19", stars: 5, title: "Good", text: "good kettle", verified: true, helpful: 0, variant: "Color: Sage" },
    ],
    questions: [
      { q: "Does it shut off automatically?", a: "Yes. It turns off when the water reaches the set temperature, and again after one hour on keep warm.", by: "Seller", date: "2026-04-16", votes: 26 },
      { q: "Is the inside all stainless or is there plastic?", a: "inside is all steel. the lid has a plastic knob on top but the water doesn't really touch it", by: "Owen", date: "2026-05-25", votes: 17 },
      { q: "Can you set it in Celsius?", a: "yes, hold the C/F button for a few seconds", by: "Redbird Customer", date: "2026-07-01", votes: 9 },
    ],
  },

  'hearth-oak-mug-set': {
    summary: "Customers say the mugs are a good size, feel solid, and look nicer in person than in the photos. Many bought them as gifts or to replace a cabinet of mismatched mugs. A few received a chipped mug, and some say the handles get hot in the microwave.",
    aspects: [
      { name: "Look", good: 640, bad: 30 },
      { name: "Size", good: 410, bad: 45 },
      { name: "Sturdiness", good: 360, bad: 58 },
      { name: "Handle", good: 180, bad: 60 },
      { name: "Arrived damaged", good: 4, bad: 62 },
    ],
    reviews: [
      { name: "Julia R.", date: "2026-03-21", stars: 5, title: "Prettier in person", text: "The speckles are a little different on each one, which I love. 14 oz is a great size for a big morning coffee.", verified: true, helpful: 22, photo: 0 },
      { name: "Nancy H.", date: "2026-06-09", stars: 2, title: "One arrived chipped", text: "Box looked fine but one mug had a chip on the rim. Getting a replacement for one mug was a hassle, they wanted me to send back the whole set.", verified: true, helpful: 29 },
      { name: "Gabe Silva", date: "2026-08-02", stars: 5, title: "Heavy in a good way", text: "Solid mugs, not thin. Been through the dishwasher probably 50 times with no fading.", verified: true, helpful: 11 },
      { name: "Anita Deshpande", date: "2026-05-16", stars: 5, title: "Gift for my sister", text: "Gave these to my sister for her new apartment and she loved them. Packed really well.", verified: true, helpful: 6 },
      { name: "Craig L.", date: "2026-09-27", stars: 4, title: "Handle gets hot", text: "Nice mugs. The handle gets pretty hot in the microwave after 2 minutes so be careful.", verified: true, helpful: 8 },
      { name: "Maya", date: "2026-04-13", stars: 5, title: "So cute", text: "perfect farmhouse look for our kitchen", verified: true, helpful: 3 },
      { name: "Roberto A.", date: "2026-07-08", stars: 5, title: "Finally matching mugs", text: "We had like 15 random mugs from old jobs and conferences. Donated them and got two sets of these. The cabinet looks so much better", verified: true, helpful: 14 },
      { name: "Helen F.", date: "2026-10-11", stars: 5, title: "Handle fits my whole hand", text: "Handle fits my whole hand, not just two fingers. Nice weight.", verified: true, helpful: 4 },
    ],
    questions: [
      { q: "Are these oven safe?", a: "These mugs are safe in the microwave and dishwasher. We do not recommend putting them in the oven.", by: "Seller", date: "2026-03-28", votes: 12 },
      { q: "How tall are they?", a: "around 4 inches I think", by: "Julia", date: "2026-04-04", votes: 5 },
      { q: "Does the speckle pattern feel bumpy?", a: "no it's smooth, the speckles are under the glaze", by: "Redbird Customer", date: "2026-08-19", votes: 3 },
    ],
  },

  'tidewell-french-press': {
    summary: "Customers say the French press makes strong, smooth coffee and the fine filter keeps most grounds out. Many like that it's simple to use and easy to clean. Some had the glass crack, and a few say a little sludge still gets through at the bottom of the cup.",
    aspects: [
      { name: "Coffee taste", good: 1980, bad: 140 },
      { name: "Filter", good: 1460, bad: 380 },
      { name: "Ease of cleaning", good: 1100, bad: 210 },
      { name: "Value", good: 1240, bad: 60 },
      { name: "Glass durability", good: 260, bad: 520 },
    ],
    reviews: [
      { name: "Victor Hale", date: "2026-05-05", stars: 5, title: "Makes great coffee", text: "Coarse ground beans, 4 minutes, press. That's it. Coffee is strong and smooth. 34 oz is about 3 of my mugs.", verified: true, helpful: 34 },
      { name: "Gerald P.", date: "2026-02-27", stars: 1, title: "Glass cracked", text: "Glass cracked down the side the second week when I poured boiling water in. It says heat safe. Maybe I got a bad one.", verified: true, helpful: 51 },
      { name: "Nora B.", date: "2026-07-29", stars: 5, title: "Cold brew too", text: "Use it for cold brew in the fridge overnight, works great.", verified: true, helpful: 13 },
      { name: "Sanjay R.", date: "2026-04-19", stars: 4, title: "Bit of sludge", text: "Filter is good but there's still a little sludge in the last sip. Normal for a French press I think. Just don't drink the last bit lol", verified: true, helpful: 9 },
      { name: "Lauren E.", date: "2026-09-13", stars: 5, title: "Easy to clean", text: "Unscrew the filter, rinse, done. Way easier than the drip machine we had.", verified: true, helpful: 7 },
      { name: "Mohammed K.", date: "2026-06-24", stars: 5, title: "Camping coffee", text: "Brought it car camping and boiled water on the camp stove. The glass made it through a bumpy dirt road wrapped in a towel.", verified: true, helpful: 6 },
      { name: "Ellen", date: "2026-08-31", stars: 4, title: "good but plunger got stiff", text: "Works well. After a few months the plunger got a little stiff going down. Took it apart and cleaned it and it's better now.", verified: true, helpful: 3 },
      { name: "Jess T.", date: "2026-03-31", stars: 5, title: "Not going back", text: "Bought it after my coffee maker died and I don't think I'm going back", verified: true, helpful: 18 },
    ],
    questions: [
      { q: "Can I get a replacement glass if it breaks?", a: "Yes. Please contact us through your order page and we can send a replacement glass carafe.", by: "Seller", date: "2026-03-06", votes: 23 },
      { q: "How many cups does it really make?", a: "about 3 normal mugs or 4 small cups", by: "Victor", date: "2026-05-18", votes: 15 },
      { q: "Is it dishwasher safe?", a: "I put the glass in the top rack and it's been fine, but I hand wash the filter", by: "Redbird Customer", date: "2026-08-07", votes: 8 },
    ],
  },

  'hearth-oak-skillet': {
    summary: "Customers say the skillet heats evenly, gives steaks a good sear, and goes from the stove to the oven easily. Many say the seasoning gets better the more they cook with it. Some find it very heavy to lift with one hand, and a few had rust spots or patchy seasoning when it arrived.",
    aspects: [
      { name: "Cooking performance", good: 1520, bad: 70 },
      { name: "Seasoning", good: 880, bad: 240 },
      { name: "Size", good: 360, bad: 90 },
      { name: "Weight", good: 210, bad: 430 },
    ],
    reviews: [
      { name: "Luke Ferraro", date: "2026-03-26", stars: 5, title: "Great sear", text: "Steaks come out with a great crust. Takes a few minutes to heat up but then it holds heat really well. Made cornbread in the oven in it too.", verified: true, helpful: 27 },
      { name: "Redbird Customer", date: "2026-07-14", stars: 3, title: "Arrived with a rust spot", text: "Had a small rust spot on the bottom when I opened it. Scrubbed it and re-seasoned it in the oven and it's fine now, but not what I expect from ready to use.", verified: true, helpful: 22 },
      { name: "Diane K.", date: "2026-05-21", stars: 4, title: "Heavy", text: "5 pounds is a lot when you're trying to lift it with one hand to pour something out. Use two hands. Cooks great.", verified: true, helpful: 16 },
      { name: "Jackson T.", date: "2026-09-04", stars: 5, title: "Eggs don't stick anymore", text: "First week eggs stuck. Kept cooking bacon and stuff in it and now a month later eggs slide right off.", verified: true, helpful: 31 },
      { name: "Amara E.", date: "2026-06-28", stars: 5, title: "Took it camping", text: "Cooked over the campfire grate all weekend. Hash browns, sausage, the works", verified: true, helpful: 7 },
      { name: "Phil G.", date: "2026-08-16", stars: 4, title: "10 inch is a little small", text: "Good pan. 10 in is small for a family though, I can fit 2 steaks max.", verified: true, helpful: 5 },
      { name: "Rosa", date: "2026-02-12", stars: 5, title: "Love it", text: "my first cast iron and it's great", verified: true, helpful: 2 },
      { name: "Ming Zhao", date: "2026-10-08", stars: 5, title: "Works on induction", text: "Using it on my induction cooktop, no issues, heats evenly.", verified: true, helpful: 9 },
    ],
    questions: [
      { q: "Is it ok on a glass top stove?", a: "yes just lift it, don't slide it around", by: "Diane", date: "2026-06-01", votes: 18 },
      { q: "Can I put it in the dishwasher?", a: "No. Hand wash it with hot water and dry it right away to keep the seasoning and prevent rust.", by: "Seller", date: "2026-04-10", votes: 25 },
      { q: "Does it come with a lid?", a: "no lid", by: "Redbird Customer", date: "2026-08-26", votes: 6 },
    ],
  },

  'tidewell-towel-set': {
    summary: "Customers say the towels feel thick and soft and are a good size. Many like the colors and say they hold up well after many washes. Some say they shed lint for the first few washes and take a long time to dry in bathrooms without a window.",
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
      { name: "Ahmed S.", date: "2026-08-23", stars: 3, title: "Slow to dry", text: "Soft but they take forever to dry hanging in our bathroom, there's no window. They get a bit musty if I don't throw them in the dryer.", verified: true, helpful: 14, variant: "Color: Sage green" },
      { name: "Lori P.", date: "2026-09-29", stars: 5, title: "Still good after lots of washes", text: "Had these 6 months and washed them probably 30 times. No fraying and the color still looks good.", verified: true, helpful: 11, variant: "Color: Sage green" },
      { name: "Kev", date: "2026-03-17", stars: 4, title: "nice", text: "nice towels. wish they were abit longer, i'm 6 foot 3", verified: true, helpful: 2, variant: "Color: Slate" },
      { name: "Esther W.", date: "2026-06-15", stars: 5, title: "Bought a second set", text: "Bought another set in white for the guest bathroom.", verified: true, helpful: 3, variant: "Color: White" },
      { name: "Nadia F.", date: "2026-10-05", stars: 5, title: "Absorbent", text: "Dries me off in one pass, I don't need a second towel for my hair.", verified: true, helpful: 6, variant: "Color: Slate" },
    ],
    questions: [
      { q: "Are these bath towels or bath sheets?", a: "They are bath towels, 30 × 56 inches each.", by: "Seller", date: "2026-04-29", votes: 13 },
      { q: "Does the white get dingy?", a: "mine are still white after a few months but i use bleach sometimes", by: "Esther", date: "2026-07-06", votes: 6 },
      { q: "Is Slate more blue or gray?", a: "Gray with a little blue in it, darker than it looks in the picture", by: "Redbird Customer", date: "2026-05-12", votes: 9 },
    ],
  },

  'fernway-throw-blanket': {
    summary: "Customers say the blanket is soft, heavy and looks great on a couch or bed. Many bought it as a gift. Some say it sheds a little at first and loses its shape after washing, and a few found it smaller than they expected.",
    aspects: [
      { name: "Look", good: 520, bad: 25 },
      { name: "Softness", good: 410, bad: 30 },
      { name: "Warmth", good: 300, bad: 20 },
      { name: "Size", good: 190, bad: 110 },
      { name: "Washing", good: 120, bad: 140 },
    ],
    reviews: [
      { name: "Allison G.", date: "2026-03-03", stars: 5, title: "Looks so good on our couch", text: "Oatmeal goes with everything. It's heavy and cozy, and my cat has claimed it.", verified: true, helpful: 18, variant: "Color: Oatmeal", photo: 0 },
      { name: "Wanda S.", date: "2026-05-09", stars: 2, title: "Stretched out after washing", text: "Washed on gentle like it says and laid it flat to dry. Still came out stretched and lumpy in places.", verified: true, helpful: 24, variant: "Color: Charcoal" },
      { name: "Frank D.", date: "2026-02-21", stars: 5, title: "Valentine's gift", text: "Got the red one for my wife for Valentine's Day and she uses it every night. It's a deep red, not bright.", verified: true, helpful: 12, variant: "Color: Cardinal red" },
      { name: "Selena M.", date: "2026-09-20", stars: 4, title: "Smaller than I thought", text: "50 by 60 is fine for one person on the couch but it doesn't cover my bed at all. Should have measured. Very soft though.", verified: true, helpful: 10, variant: "Color: Oatmeal" },
      { name: "Hugo R.", date: "2026-04-01", stars: 5, title: "Heavy and warm", text: "Almost like a weighted blanket but not quite. Warm without being sweaty", verified: true, helpful: 6, variant: "Color: Charcoal" },
      { name: "Aditi", date: "2026-10-13", stars: 4, title: "Some shedding", text: "Little fuzz balls on the couch the first week. Stopped after that. Still love it", verified: true, helpful: 4, variant: "Color: Oatmeal" },
      { name: "Rebecca J.", date: "2026-08-14", stars: 5, title: "Bought 2", text: "Bought 2 because it was on sale. One for the couch and one for my reading chair.", verified: true, helpful: 3, variant: "Color: Cardinal red" },
      { name: "Darius", date: "2026-06-06", stars: 5, title: "comfy", text: "comfy", verified: true, helpful: 0, variant: "Color: Charcoal" },
    ],
    questions: [
      { q: "Can it go in the dryer?", a: "We recommend laying it flat to dry. A dryer can stretch the knit.", by: "Seller", date: "2026-03-12", votes: 15 },
      { q: "Is it actually hand knit?", a: "pretty sure it's machine made, it just has the chunky hand knit look", by: "Redbird Customer", date: "2026-05-30", votes: 11 },
      { q: "Will it fit a twin bed?", a: "it covers the top of a twin but won't hang over the sides", by: "Selena", date: "2026-09-24", votes: 4 },
    ],
  },

  'lumen-desk-lamp': {
    summary: "Customers say the lamp is bright, easy to adjust, and the warm-to-cool settings work well for reading or working late. Many like the bendable arm. Some say the touch controls are too sensitive, and a few say the arm starts to droop after a couple of months.",
    aspects: [
      { name: "Brightness", good: 680, bad: 55 },
      { name: "Light color options", good: 520, bad: 40 },
      { name: "Arm", good: 310, bad: 150 },
      { name: "Look", good: 240, bad: 30 },
      { name: "Touch controls", good: 210, bad: 260 },
    ],
    reviews: [
      { name: "Marguerite L.", date: "2026-06-26", stars: 5, title: "Finally I can read my mail", text: "I have macular degeneration and need a lot of light to read. On the brightest cool setting, with the arm pulled right over the page, I can read my mail and my pill bottles without my magnifier. The touch buttons are a little hard to find by feel, so I put a small bump sticker on the on/off one and now it's no problem.", verified: true, helpful: 74 },
      { name: "Ryan Cho", date: "2026-04-11", stars: 4, title: "Too sensitive", text: "Bright and nice light but the touch button turns on if I brush it with my sleeve. Happens a few times a day.", verified: true, helpful: 19 },
      { name: "Trevor J.", date: "2026-08-19", stars: 1, title: "Arm won't stay up", text: "After 2 months the arm slowly droops and won't hold the position. It's basically pointing at the base now.", verified: true, helpful: 28 },
      { name: "Jasmine T.", date: "2026-09-22", stars: 5, title: "Late night studying", text: "I use the warm setting at night in my dorm so it doesn't bother my roommate, and the cool bright one during the day.", verified: true, helpful: 11 },
      { name: "Paulo N.", date: "2026-03-20", stars: 5, title: "Better video calls", text: "I point it at the wall behind my laptop and I look way better on work video calls.", verified: true, helpful: 7 },
      { name: "Ingrid S.", date: "2026-05-24", stars: 3, title: "Flickers at the lowest setting", text: "On the lowest brightness I can see a slight flicker. At normal brightness it's fine.", verified: true, helpful: 9 },
      { name: "Ollie", date: "2026-07-17", stars: 4, title: "nice lamp", text: "nice lamp, clean white look", verified: true, helpful: 1 },
      { name: "A. Mensah", date: "2026-10-15", stars: 5, title: "Colors look right", text: "I paint miniatures and the light shows colors accurately. It doesn't make reds look orange like my old lamp did", verified: true, helpful: 13 },
    ],
    questions: [
      { q: "Does it have a USB port or wireless charger for my phone?", a: "This model does not have a USB port or a wireless charger. It is a lamp only and plugs into the wall.", by: "Seller", date: "2026-04-22", votes: 21 },
      { q: "Does it remember the last brightness?", a: "yes mine comes back on at the same setting", by: "Ryan", date: "2026-05-07", votes: 8 },
      { q: "Does it clamp to the desk?", a: "no, it has a heavy base", by: "Redbird Customer", date: "2026-07-23", votes: 5 },
    ],
  },

  'fernway-planter': {
    summary: "Customers say the snake plant arrived healthy and the white pot looks clean and simple. Many say it's easy to keep alive, even for people who usually kill plants. Some got a smaller plant than the photo suggested, and a few had a cracked pot or bent leaves from shipping.",
    aspects: [
      { name: "Plant health", good: 210, bad: 60 },
      { name: "Pot", good: 180, bad: 35 },
      { name: "Packaging", good: 90, bad: 70 },
      { name: "Plant size", good: 40, bad: 120 },
    ],
    reviews: [
      { name: "Brianna C.", date: "2026-07-22", stars: 5, title: "I haven't killed it", text: "I kill every plant I own. 4 months in and this one is still alive and growing a new leaf. I water it when I remember, about every 2 weeks.", verified: true, helpful: 21, photo: 0 },
      { name: "Liz M.", date: "2026-05-01", stars: 1, title: "Pot arrived cracked", text: "Pot had a crack down one side and there was dirt all over the box. Plant seemed ok.", verified: true, helpful: 18, photo: 1 },
      { name: "Theo M.", date: "2026-08-12", stars: 4, title: "Smaller than the picture", text: "Plant is healthy but it's maybe 10 inches tall, the picture made it look bigger. Pot is nice", verified: true, helpful: 15 },
      { name: "Fiona O.", date: "2026-03-25", stars: 5, title: "Good office plant", text: "Sits on my desk at work with only the overhead lights and it's doing fine.", verified: true, helpful: 6 },
      { name: "Carmen D.", date: "2026-06-17", stars: 2, title: "Leaves were bent", text: "Two of the leaves were folded in half from shipping and they never straightened out. Had to cut them off.", verified: true, helpful: 9 },
      { name: "Jamie", date: "2026-09-10", stars: 4, title: "No drainage hole", text: "Pretty pot but there's no drainage hole, so be careful not to overwater.", verified: true, helpful: 12 },
      { name: "Uma P.", date: "2026-04-15", stars: 5, title: "Housewarming gift", text: "Sent one to a friend's new place and she loved it", verified: true, helpful: 2 },
      { name: "G. Morales", date: "2026-10-09", stars: 5, title: "Nice", text: "Looks great on my bookshelf.", verified: true, helpful: 1 },
    ],
    questions: [
      { q: "Is this safe for cats?", a: "Snake plants can upset a cat's stomach if eaten. We suggest keeping it out of reach of pets.", by: "Seller", date: "2026-04-27", votes: 19 },
      { q: "Does the pot have a drainage hole?", a: "mine doesn't", by: "Jamie", date: "2026-09-12", votes: 10 },
      { q: "How tall is the plant?", a: "mine was about 12 inches from the top of the pot", by: "Redbird Customer", date: "2026-06-03", votes: 7 },
    ],
  },

  // ── Clothing & shoes ─────────────────────────────────────────────────────
  'saltgrass-hoodie': {
    summary: "Customers say the hoodie is soft inside, warm, and a good weight for everyday wear. Many like the colors and the big front pocket. Some say it shrinks in the dryer and runs a little short in the body, so a few suggest ordering one size up.",
    aspects: [
      { name: "Softness", good: 1420, bad: 60 },
      { name: "Fit", good: 980, bad: 510 },
      { name: "Color", good: 860, bad: 120 },
      { name: "Warmth", good: 690, bad: 30 },
      { name: "Shrinking", good: 70, bad: 340 },
    ],
    reviews: [
      { name: "Alexis M.", date: "2026-09-18", stars: 5, title: "My favorite hoodie now", text: "Super soft inside and not too heavy, perfect for fall mornings. The Forest green is a nice deep green.", verified: true, helpful: 33, variant: "Color: Forest green, Size: M", photo: 0 },
      { name: "Brooke H.", date: "2026-03-10", stars: 2, title: "Shrank a full size", text: "Washed it once in warm and dried on medium and now it's short on me. Sleeves too. Size up or air dry it", verified: true, helpful: 47, variant: "Color: Heather gray, Size: L" },
      { name: "Connor B.", date: "2026-02-14", stars: 4, title: "Runs a bit small", text: "I'm normally a large and the L fit more like a snug medium. Exchanged for an XL and it's right. Very soft though.", verified: true, helpful: 29, variant: "Color: Navy, Size: XL" },
      { name: "Maribel S.", date: "2026-04-03", stars: 5, title: "Bought for my husband", text: "He wears it every weekend. He's 5'10 and about 180 and the L fits him well.", verified: true, helpful: 8, variant: "Color: Black, Size: L" },
      { name: "Hannah W.", date: "2026-10-01", stars: 5, title: "I live in this on campus", text: "I live in this thing on campus. The pocket fits my phone and my keys. Cardinal red is a true deep red", verified: true, helpful: 12, variant: "Color: Cardinal red, Size: M" },
      { name: "Derek O.", date: "2026-06-07", stars: 4, title: "Pills a little", text: "Some pilling on the sides where my arms rub, after about 2 months. Still comfortable.", verified: true, helpful: 9, variant: "Color: Heather gray, Size: XXL" },
      { name: "Tomoko I.", date: "2026-08-09", stars: 5, title: "Unisex sizing works", text: "I'm a women's medium and got the S for a relaxed but not baggy fit.", verified: true, helpful: 14, variant: "Color: Navy, Size: S" },
      { name: "Leo", date: "2026-05-14", stars: 5, title: "Cozy", text: "cozy", verified: true, helpful: 2, variant: "Color: Cardinal red, Size: S" },
    ],
    questions: [
      { q: "Is this men's or women's sizing?", a: "It is unisex sizing. Women may want to order one size down for a closer fit.", by: "Seller", date: "2026-02-20", votes: 31 },
      { q: "Does it shrink?", a: "yes some if you dry it hot. i air dry mine", by: "Alexis", date: "2026-09-23", votes: 22 },
      { q: "Is the Navy close to black?", a: "it's a dark navy, you can tell it's blue in daylight", by: "Redbird Customer", date: "2026-04-08", votes: 6 },
    ],
  },

  'saltgrass-tee-3pack': {
    summary: "Customers say the shirts are soft, a decent thickness for the price, and the classic fit works on its own or under a button-up. Many reorder them when old ones wear out. Some say the shirts shrink in length after washing, the white one is a bit see-through, and the neck stretches out over time.",
    aspects: [
      { name: "Comfort", good: 1840, bad: 120 },
      { name: "Value", good: 1620, bad: 90 },
      { name: "Thickness", good: 520, bad: 440 },
      { name: "Neck shape", good: 210, bad: 280 },
      { name: "Shrinking", good: 110, bad: 620 },
    ],
    reviews: [
      { name: "Rob Jennings", date: "2026-05-26", stars: 5, title: "Good everyday tees", text: "Soft, not too thin, not too thick. I wear the gray and navy on their own and the white under work shirts.", verified: true, helpful: 22, variant: "Size: L" },
      { name: "Redbird Customer", date: "2026-07-04", stars: 1, title: "Shrank 2 inches", text: "Washed in cold, dried on low, and they got about 2 inches shorter. Now they're basically crop tops on me. Super disappointed", verified: true, helpful: 39, variant: "Size: XL" },
      { name: "Javier P.", date: "2026-03-15", stars: 4, title: "White is see-through", text: "Navy and gray are great. You can see through the white one a little.", verified: true, helpful: 18, variant: "Size: M" },
      { name: "Andrew K.", date: "2026-09-12", stars: 5, title: "Reordered 3 times", text: "This is my 3rd pack. Easy to just restock when they wear out", verified: true, helpful: 7, variant: "Size: L" },
      { name: "Sunil V.", date: "2026-08-05", stars: 3, title: "neck stretched", text: "after a few months the neck on the white one got wavy. others ok", verified: true, helpful: 11, variant: "Size: M" },
      { name: "Beth A.", date: "2026-04-23", stars: 5, title: "Bought for my son", text: "My teenage son lives in these. Good price for 3.", verified: true, helpful: 3, variant: "Size: S" },
      { name: "Kyle D.", date: "2026-06-19", stars: 4, title: "Fit is boxy", text: "Classic fit means kind of boxy. Fine for me, just know it's not a slim fit.", verified: true, helpful: 6, variant: "Size: XXL" },
      { name: "Ola", date: "2026-10-10", stars: 5, title: "Good value", text: "good shirts for the price", verified: true, helpful: 1, variant: "Size: L" },
    ],
    questions: [
      { q: "Can I choose the colors in the pack?", a: "The pack always comes with one white, one gray and one navy shirt.", by: "Seller", date: "2026-03-19", votes: 17 },
      { q: "Do these have a tag in the neck?", a: "no tag, the size is printed on the inside", by: "Rob", date: "2026-06-02", votes: 9 },
      { q: "Are they long enough to tuck in?", a: "barely for me at 6 ft, I size up when I need to tuck", by: "Redbird Customer", date: "2026-08-15", votes: 5 },
    ],
  },

  'mesa-trail-runners': {
    summary: "Customers say the shoes are light, comfortable right out of the box, and good for both running and walking. Many like the breathable mesh in hot weather. Some say they run small and only come in whole sizes, the mesh tore near the toe after a few months, and the white pair gets dirty fast.",
    aspects: [
      { name: "Comfort", good: 620, bad: 70 },
      { name: "Weight", good: 410, bad: 15 },
      { name: "Grip", good: 260, bad: 40 },
      { name: "Durability", good: 210, bad: 190 },
      { name: "Sizing", good: 180, bad: 360 },
    ],
    reviews: [
      { name: "Matt Reyes", date: "2026-04-16", stars: 5, title: "Light and comfy", text: "Ran 5 miles the first day with no break in. They feel really light.", verified: true, helpful: 18, variant: "Color: Gray / red, Size: 10" },
      { name: "Nikhil S.", date: "2026-06-10", stars: 4, title: "Order a size up", text: "I'm usually a 9 and these were tight in the toes. Exchanged for a 10 and they're perfect. They only come in whole sizes so I had to go up a full size.", verified: true, helpful: 41, variant: "Color: White, Size: 10" },
      { name: "runner_dave", date: "2026-09-05", stars: 1, title: "Mesh ripped", text: "Mesh tore by my big toe after about 3 months of running 3 times a week. Sole still looks new.", verified: true, helpful: 33, variant: "Color: Black, Size: 11" },
      { name: "Ray B.", date: "2026-03-07", stars: 5, title: "Good for being on your feet all day", text: "I'm on my feet 10 hours a day at the warehouse and these are better than the work shoes I had. Good cushion.", verified: true, helpful: 15, variant: "Color: Black, Size: 12" },
      { name: "Kristen L.", date: "2026-07-19", stars: 2, title: "White gets dirty", text: "The white ones looked great for one day. The mesh holds onto dirt and doesn't really come clean.", verified: true, helpful: 12, variant: "Color: White, Size: 8" },
      { name: "Diego Lopes", date: "2026-08-01", stars: 5, title: "Great in hot weather", text: "Ran in 100 degree heat in Phoenix and my feet didn't feel cooked", verified: true, helpful: 8, variant: "Color: Gray / red, Size: 9" },
      { name: "Sean W.", date: "2026-05-13", stars: 4, title: "Grip is good, a bit narrow", text: "Grips well on wet pavement. A little narrow for my wide feet.", verified: true, helpful: 9, variant: "Color: Black, Size: 11" },
      { name: "Elliot", date: "2026-10-03", stars: 5, title: "Good shoes", text: "comfortable, cheap enough, look fine", verified: true, helpful: 0, variant: "Color: Gray / red, Size: 13" },
    ],
    questions: [
      { q: "Do these come in half sizes?", a: "These come in whole sizes only, from 7 to 13.", by: "Seller", date: "2026-04-02", votes: 27 },
      { q: "Are they good for trail running?", a: "easy trails yes, rocky stuff not really, the sole is more for road", by: "Matt", date: "2026-05-08", votes: 12 },
      { q: "Is the Gray / red mostly gray?", a: "yes mostly gray, red on the heel and the laces", by: "Redbird Customer", date: "2026-07-26", votes: 4 },
    ],
  },

  'saltgrass-rain-jacket': {
    summary: "Customers say the jacket keeps them dry in steady rain and packs down small enough for a bag or suitcase. Many take it hiking and traveling. Some say it gets sweaty inside on warm days, and a few say the fit is boxy or the sleeves run short.",
    aspects: [
      { name: "Packability", good: 410, bad: 12 },
      { name: "Waterproof", good: 380, bad: 45 },
      { name: "Fit", good: 220, bad: 130 },
      { name: "Hood", good: 180, bad: 50 },
      { name: "Breathability", good: 90, bad: 160 },
    ],
    reviews: [
      { name: "Clara J.", date: "2026-03-04", stars: 5, title: "Dry in a downpour", text: "Walked 30 minutes home in a real downpour and stayed completely dry. The hood stays on with the drawstring.", verified: true, helpful: 24, variant: "Color: Olive, Size: M" },
      { name: "Colleen F.", date: "2026-06-13", stars: 2, title: "Sweaty", text: "Keeps the rain out but it's like wearing a trash bag if it's warm out. I was wetter from sweat than I would have been from the rain.", verified: true, helpful: 19, variant: "Color: Navy, Size: L" },
      { name: "Tamsin R.", date: "2026-05-02", stars: 5, title: "Folds into its own pocket", text: "Packs into its own pocket, about the size of a sandwich. It lives in my backpack now.", verified: true, helpful: 13, variant: "Color: Cardinal red, Size: S", photo: 0 },
      { name: "Yolanda P.", date: "2026-09-16", stars: 3, title: "Sleeves are short", text: "I have long arms and the sleeves end above my wrist. Jacket works fine otherwise.", verified: true, helpful: 8, variant: "Color: Olive, Size: L" },
      { name: "Erin K.", date: "2026-04-20", stars: 5, title: "A week in Seattle", text: "Wore it every day in Seattle for a week. Didn't need an umbrella once.", verified: true, helpful: 10, variant: "Color: Navy, Size: M" },
      { name: "Mira", date: "2026-07-27", stars: 4, title: "Boxy", text: "it's a bit boxy but I like having room for a sweater under it", verified: true, helpful: 4, variant: "Color: Olive, Size: XS" },
      { name: "Grace T.", date: "2026-10-07", stars: 5, title: "Easy to see on dog walks", text: "The red is easy to see at dusk when I walk my dog, that's why I picked it.", verified: true, helpful: 6, variant: "Color: Cardinal red, Size: M" },
      { name: "Patti", date: "2026-02-25", stars: 5, title: "Perfect", text: "Light and dry. Perfect", verified: true, helpful: 1, variant: "Color: Navy, Size: XL" },
    ],
    questions: [
      { q: "Does it run small?", a: "true to size for me, with room for a sweater", by: "Clara", date: "2026-03-09", votes: 14 },
      { q: "Is it waterproof or just water resistant?", a: "It is waterproof, rated to 10,000 mm, with taped seams.", by: "Seller", date: "2026-04-14", votes: 11 },
      { q: "Do the pockets zip?", a: "yes both hand pockets zip", by: "Redbird Customer", date: "2026-06-21", votes: 5 },
    ],
  },

  'saltgrass-beanie': {
    summary: "Customers say the beanie is warm, soft, and not itchy, even for people who usually can't wear wool. Many like the simple ribbed look. A few say it's snug on larger heads and that it stretched out after a machine wash.",
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
    summary: "Customers say the bottle keeps water cold all day, doesn't leak in a bag, and is a good size for work, school and the gym. Many like the loop cap for carrying. Some say the paint chips when it's dropped and that it's too wide for many car cup holders.",
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
      { name: "Ethan C.", date: "2026-03-18", stars: 5, title: "Doesn't leak", text: "I throw it in my backpack next to my laptop every day and it's never leaked once.", verified: true, helpful: 31, variant: "Color: Black" },
      { name: "Jada M.", date: "2026-08-30", stars: 4, title: "Doesn't fit my cup holder", text: "Great bottle but it's too wide for the cup holder in my car. Have to put it on the floor.", verified: true, helpful: 23, variant: "Color: Cardinal red" },
      { name: "Stan K.", date: "2026-06-01", stars: 5, title: "Gym bottle", text: "24 oz is the right size for an hour at the gym. Loop cap hangs on my finger", verified: true, helpful: 8, variant: "Color: Black" },
      { name: "Vanessa O.", date: "2026-09-24", stars: 5, title: "Glacier white looks so clean", text: "Very clean white color, hasn't stained yet after 3 months of using it every day.", verified: true, helpful: 7, variant: "Color: Glacier white" },
      { name: "Irene H.", date: "2026-04-28", stars: 5, title: "Bought for the whole family", text: "Bought one in every color so the kids stop fighting over whose is whose. It works.", verified: true, helpful: 19, variant: "Color: Ocean blue" },
      { name: "noah_r", date: "2026-10-12", stars: 5, title: "best", text: "best bottle i've owned", verified: true, helpful: 2, variant: "Color: Sage" },
    ],
    questions: [
      { q: "Can it go in the dishwasher?", a: "We recommend hand washing the bottle to protect the paint. The cap is top-rack dishwasher safe.", by: "Seller", date: "2026-03-24", votes: 52 },
      { q: "Does it fit in a car cup holder?", a: "not in mine (sedan), too wide", by: "Jada", date: "2026-09-02", votes: 29 },
      { q: "Can you put hot coffee in it?", a: "yes, stays hot for hours. the loop cap isn't great for sipping hot stuff though", by: "Redbird Customer", date: "2026-06-16", votes: 13 },
    ],
  },

  'mesa-trail-daypack': {
    summary: "Customers say the daypack is light, comfortable, and holds enough for a full day hike. Many like the padded straps and the sleeve for a water bladder. Some say it isn't fully waterproof in heavy rain, and a few say the side pockets are too shallow to hold a water bottle securely.",
    aspects: [
      { name: "Comfort", good: 460, bad: 40 },
      { name: "Size", good: 380, bad: 60 },
      { name: "Durability", good: 300, bad: 45 },
      { name: "Pockets", good: 250, bad: 150 },
      { name: "Water resistance", good: 210, bad: 110 },
    ],
    reviews: [
      { name: "Nate Holloway", date: "2026-05-17", stars: 5, title: "Perfect for day hikes", text: "Did 8 miles at Point Reyes with water, lunch, a jacket and my camera. Didn't feel heavy and the straps didn't dig in.", verified: true, helpful: 26, photo: 0 },
      { name: "Corey B.", date: "2026-07-24", stars: 2, title: "Bottle fell out of the side pocket", text: "The side pockets are shallow and my water bottle fell out twice when I bent over. Lost one down a hill", verified: true, helpful: 21 },
      { name: "Meera J.", date: "2026-03-29", stars: 4, title: "Not waterproof", text: "Light rain is fine. Got caught in a real storm and the stuff at the bottom got damp. It says water resistant so that's fair.", verified: true, helpful: 15 },
      { name: "Tobias W.", date: "2026-09-07", stars: 5, title: "Commuter bag too", text: "I use it to bike to work. My laptop fits in the hydration sleeve lol. Light, and my back doesn't get too sweaty.", verified: true, helpful: 9 },
      { name: "Kara L.", date: "2026-08-11", stars: 5, title: "Holds up", text: "Used it most weekends since last fall plus a trip to Zion. No rips, zippers still smooth.", verified: true, helpful: 12 },
      { name: "Felix A.", date: "2026-06-05", stars: 4, title: "Wish it had a hip belt", text: "Comfortable, but there's no padded hip belt so with heavy stuff it's all on your shoulders.", verified: true, helpful: 7 },
      { name: "Dana S.", date: "2026-10-02", stars: 5, title: "Great size", text: "Great size for my kid's school stuff too", verified: true, helpful: 2 },
      { name: "Hiro N.", date: "2026-04-12", stars: 5, title: "Light", text: "Light, lots of pockets inside, good price.", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Will a 15 inch laptop fit?", a: "mine fits in the hydration sleeve but it's tight", by: "Tobias", date: "2026-09-09", votes: 12 },
      { q: "Does it come with a water bladder?", a: "No. The pack has a sleeve and a hose opening for a water bladder, but the bladder is sold separately.", by: "Seller", date: "2026-04-25", votes: 16 },
      { q: "Is there a chest strap?", a: "yes, it slides up and down", by: "Redbird Customer", date: "2026-06-30", votes: 4 },
    ],
  },

  'foxglove-yoga-mat': {
    summary: "Customers say the mat is thick enough to protect their knees and doesn't slide on hard floors. Many like that it comes with a carrying strap. Some say it has a rubbery smell at first, gets slippery when hands are sweaty, and the ends curl up for the first few days.",
    aspects: [
      { name: "Cushioning", good: 1120, bad: 80 },
      { name: "Grip", good: 980, bad: 310 },
      { name: "Durability", good: 410, bad: 190 },
      { name: "Strap", good: 280, bad: 70 },
      { name: "Smell", good: 40, bad: 260 },
    ],
    reviews: [
      { name: "Rosalind K.", date: "2026-04-06", stars: 5, title: "Easy on my knees", text: "6mm is the right thickness for my knees. I don't have to fold it over for kneeling poses anymore.", verified: true, helpful: 21, variant: "Color: Plum" },
      { name: "Nia W.", date: "2026-07-11", stars: 2, title: "Slippery once I sweat", text: "Fine for slow yoga. In hot yoga or any time I'm sweating my hands slide.", verified: true, helpful: 25, variant: "Color: Dusty blue" },
      { name: "Brent M.", date: "2026-02-23", stars: 3, title: "Smell", text: "Strong rubbery smell when I opened it. Left it unrolled on the porch for 2 days and it's mostly gone now.", verified: true, helpful: 17, variant: "Color: Sage" },
      { name: "Isla", date: "2026-05-31", stars: 5, title: "Doesn't move", text: "Doesn't slide on my wood floor at all", verified: true, helpful: 6, variant: "Color: Dusty blue" },
      { name: "Tanya G.", date: "2026-09-14", stars: 5, title: "Strap is handy", text: "I walk to class and the strap makes it easy to carry over my shoulder.", verified: true, helpful: 4, variant: "Color: Plum" },
      { name: "Jun P.", date: "2026-08-04", stars: 4, title: "Ends curl", text: "The ends curled up for the first week. Rolled it the other way overnight and it flattened out.", verified: true, helpful: 9, variant: "Color: Sage" },
      { name: "Ken L.", date: "2026-06-23", stars: 5, title: "Home workouts", text: "I use it for stretching and floor exercises at home every day. 4 months in, no tears.", verified: true, helpful: 7, variant: "Color: Dusty blue" },
      { name: "Mariah D.", date: "2026-10-06", stars: 5, title: "Comfy", text: "Plum color is pretty and it's really comfy", verified: true, helpful: 1, variant: "Color: Plum" },
    ],
    questions: [
      { q: "How long is it?", a: "It is 72 inches long and 24 inches wide.", by: "Seller", date: "2026-03-03", votes: 9 },
      { q: "Is it long enough for tall people?", a: "I'm 6'1 and it's just long enough", by: "Brent", date: "2026-03-11", votes: 7 },
      { q: "Does it smell?", a: "a little at first, goes away in a few days", by: "Redbird Customer", date: "2026-07-15", votes: 12 },
    ],
  },

  'mesa-trail-lantern': {
    summary: "Customers say the lantern is bright enough to light a whole tent or campsite, and the battery lasts several nights on the lower settings. Many keep one at home for power outages. Some say the 20-hour battery life only applies to the dimmest mode, and a few say the hanging hook feels flimsy.",
    aspects: [
      { name: "Brightness", good: 780, bad: 40 },
      { name: "Battery life", good: 640, bad: 170 },
      { name: "USB-C charging", good: 420, bad: 30 },
      { name: "Build quality", good: 310, bad: 120 },
    ],
    reviews: [
      { name: "Doug F.", date: "2026-07-06", stars: 5, title: "Lit up the whole campsite", text: "Used it 3 nights camping at Big Basin. On medium it lit up the whole picnic table area and the battery still had about half left at the end.", verified: true, helpful: 29 },
      { name: "Gary Simmons", date: "2026-08-24", stars: 2, title: "20 hours is only on the lowest setting", text: "On high it lasted about 3 and a half hours. The 20 hours must be on the dimmest mode. Kind of misleading", verified: true, helpful: 38 },
      { name: "Cynthia A.", date: "2026-02-15", stars: 5, title: "Used it in a power outage", text: "Our power was out for 2 days after a storm. This lit the kitchen and living room and I recharged it off a power bank.", verified: true, helpful: 22 },
      { name: "Ben", date: "2026-05-10", stars: 4, title: "Hook is flimsy", text: "The hanging hook on top feels thin. Hasn't broken yet but I'm careful with it.", verified: true, helpful: 8 },
      { name: "Akosua M.", date: "2026-06-29", stars: 5, title: "Glad it's USB-C", text: "Charges off the same cable as my phone. No more buying batteries.", verified: true, helpful: 11 },
      { name: "Joel R.", date: "2026-09-19", stars: 5, title: "Bright", text: "Really bright. Too bright for inside the tent on high honestly, we keep it on low.", verified: true, helpful: 6 },
      { name: "Pilar G.", date: "2026-04-18", stars: 4, title: "No battery indicator", text: "Wish it showed how much battery is left. It just dies.", verified: true, helpful: 10 },
      { name: "Ty", date: "2026-10-11", stars: 5, title: "Great", text: "great lantern for the price", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Can it charge a phone?", a: "No. This lantern does not have an output port, so it cannot charge other devices.", by: "Seller", date: "2026-05-04", votes: 14 },
      { q: "Is it waterproof?", a: "it's been fine in the rain, I wouldn't drop it in a lake", by: "Doug", date: "2026-07-09", votes: 9 },
      { q: "How long does it take to fully charge?", a: "about 4 hours for me", by: "Redbird Customer", date: "2026-08-27", votes: 6 },
    ],
  },

  // ── Books ────────────────────────────────────────────────────────────────
  'book-orchard-at-dusk': {
    summary: "Customers say the novel is moving, the family feels real, and the last chapters stay with them. Book clubs like the discussion guide in the back. Some say the middle drags, and a few found the jumps between generations hard to follow.",
    aspects: [
      { name: "Characters", good: 820, bad: 90 },
      { name: "Story", good: 760, bad: 180 },
      { name: "Writing", good: 690, bad: 110 },
      { name: "Pacing", good: 210, bad: 340 },
    ],
    reviews: [
      { name: "Margaret E.", date: "2026-04-21", stars: 5, title: "Our book club loved it", text: "Picked it for our book club and it was the best discussion we've had all year. The guide in the back helped. Several of us cried at the end.", verified: true, helpful: 58 },
      { name: "Ellie K.", date: "2026-08-03", stars: 5, title: "I called my dad after", text: "I don't usually write reviews. I picked this up because I liked the cover and ended up reading it on a camping trip over three days. It's about a family that's had the same orchard for three generations and what happens when the youngest daughter has to decide whether to sell. Nothing huge happens, it's more about small moments and old arguments that never got settled. The chapters with the grandfather during the drought are the strongest part. I called my own dad after I finished it, which I think says enough.", verified: true, helpful: 64 },
      { name: "Deb L.", date: "2026-06-11", stars: 2, title: "Slow", text: "I wanted to like this. The first 100 pages are great and then nothing happens for a long time. Didn't finish", verified: true, helpful: 31 },
      { name: "Leticia R.", date: "2026-05-15", stars: 5, title: "Felt like my family", text: "My grandparents had a farm in the Central Valley and so much of this felt familiar. The grandmother is my favorite character in a long time.", verified: true, helpful: 27 },
      { name: "Owen T.", date: "2026-07-02", stars: 3, title: "Hard to follow", text: "Jumping between three generations got confusing. I kept flipping back to see who was who. Wish there was a family tree in the front.", verified: true, helpful: 22 },
      { name: "Ravi M.", date: "2026-09-30", stars: 4, title: "Good, not great", text: "Good story and beautiful writing about the orchard itself. The ending felt a bit rushed", verified: true, helpful: 9 },
      { name: "Sarah B.", date: "2026-03-08", stars: 5, title: "Beautiful hardcover", text: "Gave it to my mom for her birthday. The cover is gorgeous in person.", verified: true, helpful: 6 },
      { name: "Jill", date: "2026-10-14", stars: 5, title: "Read it in 2 nights", text: "couldn't put it down. read it in 2 nights", verified: true, helpful: 4 },
    ],
    questions: [
      { q: "Is there a large print edition?", a: "Not at this time. This store carries the hardcover only.", by: "Seller", date: "2026-05-06", votes: 11 },
      { q: "Is it ok for a teenager?", a: "some mild language and a sad death but nothing graphic. fine for 15 and up", by: "Margaret", date: "2026-04-26", votes: 8 },
      { q: "Is the book club guide just questions?", a: "questions plus a short interview with the author", by: "Redbird Customer", date: "2026-07-18", votes: 4 },
    ],
  },

  'book-small-habits': {
    summary: "Customers say the book is easy to read, the chapters are short, and the exercise at the end of each one helps them actually get started. Many say it helped with small routines like walking or reading more. Some say the ideas are familiar from other habit books and the advice is too basic.",
    aspects: [
      { name: "Easy to read", good: 1840, bad: 60 },
      { name: "Exercises", good: 1210, bad: 180 },
      { name: "Length", good: 680, bad: 90 },
      { name: "Originality", good: 160, bad: 720 },
    ],
    reviews: [
      { name: "Kendra W.", date: "2026-03-22", stars: 5, title: "Actually did the exercises", text: "I've read a few books like this and never did anything. The exercises are so short I actually did them. I've walked every day for 2 months now.", verified: true, helpful: 47 },
      { name: "P. Kowalski", date: "2026-06-20", stars: 1, title: "Nothing new", text: "Every idea in here I've read before somewhere. Start small, track it, reward yourself. Could've been a blog post", verified: true, helpful: 52 },
      { name: "Tom Becker", date: "2026-04-30", stars: 4, title: "Good for beginners", text: "If you've never read about habits this is a good start. Short chapters, easy to read on the bus.", verified: true, helpful: 11 },
      { name: "Linda O.", date: "2026-08-08", stars: 5, title: "Gave copies to my team", text: "I manage a small team and bought a copy for everyone. We did one chapter a week at our Monday meeting.", verified: true, helpful: 16 },
      { name: "Ahmad R.", date: "2026-05-27", stars: 3, title: "Ok", text: "Some helpful stuff in the first half. Second half felt like the same thing again", verified: true, helpful: 8 },
      { name: "Yasmin K.", date: "2026-02-08", stars: 5, title: "Helped after a rough year", text: "After a hard year this helped me get back to small things like making my bed and reading 10 pages a night. It's simple, but sometimes simple is what you need.", verified: true, helpful: 24 },
      { name: "Gordon S.", date: "2026-09-21", stars: 4, title: "Paper is thin", text: "Content is fine. The paper is thin and you can see the ink from the other side a little.", verified: true, helpful: 5 },
      { name: "Becca", date: "2026-07-13", stars: 5, title: "Easy read", text: "Easy read, finished it in a weekend", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Is there an audiobook?", a: "This store sells the paperback only.", by: "Seller", date: "2026-04-09", votes: 9 },
      { q: "How long are the chapters?", a: "like 8-10 pages each", by: "Kendra", date: "2026-03-28", votes: 13 },
      { q: "Is it religious at all?", a: "no not at all", by: "Redbird Customer", date: "2026-06-26", votes: 6 },
    ],
  },

  'book-bay-area-birds': {
    summary: "Customers say the drawings are clear, the range maps help them know where to look, and the guide is small enough to carry on walks. Many bought it for a parent or child who is getting into birding. A few wish it had photos instead of drawings or included information on bird calls.",
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
      { name: "Hal N.", date: "2026-09-26", stars: 4, title: "Cover bends", text: "Great guide but the flexible cover is getting creased from my pocket. Still holding together.", verified: true, helpful: 5 },
      { name: "S. Ibrahim", date: "2026-03-14", stars: 5, title: "Only the birds you'll actually see", text: "Love that it's only Bay Area birds so I'm not flipping past hundreds of species that never show up here.", verified: true, helpful: 18 },
      { name: "Joan P.", date: "2026-07-01", stars: 5, title: "Good for beginners", text: "It's grouped by type so even a beginner like me can find things. Started in March and I already know the common ones in my yard.", verified: true, helpful: 6 },
      { name: "Clementine", date: "2026-10-08", stars: 5, title: "Beautiful", text: "Beautiful book. My 9 year old loves it", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Does it include water birds?", a: "yes there's a big section on shorebirds and ducks", by: "Walter", date: "2026-04-28", votes: 8 },
      { q: "Is it waterproof?", a: "The cover is water resistant, but the pages are regular paper.", by: "Seller", date: "2026-05-19", votes: 5 },
      { q: "Would this be useful in Sacramento?", a: "a lot of the same birds but some are coastal only, so maybe 70% useful", by: "Redbird Customer", date: "2026-08-22", votes: 3 },
    ],
  },

  // ── Grocery ──────────────────────────────────────────────────────────────
  'grocery-coffee-beans': {
    summary: "Customers say the coffee is smooth, not bitter, and a good value for everyday drinking. Many like the hint of chocolate and use it in drip machines, French presses and espresso makers. Some got a bag that tasted stale, and a few find the flavor plain.",
    aspects: [
      { name: "Taste", good: 1620, bad: 310 },
      { name: "Value", good: 1180, bad: 120 },
      { name: "Smell", good: 640, bad: 60 },
      { name: "Freshness", good: 210, bad: 290 },
    ],
    reviews: [
      { name: "Elena V.", date: "2026-07-07", stars: 5, title: "Smooth daily coffee", text: "Smooth, a little chocolatey, not bitter. I've been on the subscription for 6 months.", verified: true, helpful: 20 },
      { name: "Vince D.", date: "2026-04-14", stars: 1, title: "Stale bag", text: "Roast date on my bag was 4 months ago. Tasted flat and dusty. The second bag was better but still", verified: true, helpful: 26 },
      { name: "Michael O.", date: "2026-05-22", stars: 4, title: "Good in the French press", text: "Makes a nice cup in my French press. Not fancy, but good.", verified: true, helpful: 7 },
      { name: "Danielle H.", date: "2026-09-01", stars: 5, title: "Great value", text: "Cheaper than the beans at my local shop and honestly I can't tell much difference first thing in the morning.", verified: true, helpful: 14 },
      { name: "Paolo R.", date: "2026-03-30", stars: 3, title: "Bit plain", text: "It's fine. Kind of plain. Good for when guests want coffee and I don't want to use the good stuff", verified: true, helpful: 9 },
      { name: "Arnold B.", date: "2026-08-18", stars: 4, title: "Bag doesn't reseal well", text: "Coffee is good but the bag doesn't close back up well. I move it into a jar.", verified: true, helpful: 5 },
      { name: "Sunny L.", date: "2026-06-15", stars: 5, title: "Works for espresso", text: "Ground fine it works for espresso, crema is decent for a medium roast.", verified: true, helpful: 6 },
      { name: "Kat S.", date: "2026-10-05", stars: 5, title: "Smells great", text: "smells amazing when I grind it", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Is there a roast date on the bag?", a: "Yes. Each bag shows a roast date on the back.", by: "Seller", date: "2026-04-20", votes: 13 },
      { q: "Are the beans oily?", a: "no not oily, it's a medium roast so they're pretty dry", by: "Elena", date: "2026-07-10", votes: 5 },
      { q: "Is it decaf?", a: "no this one is regular", by: "Redbird Customer", date: "2026-05-29", votes: 4 },
    ],
  },

  'grocery-granola': {
    summary: "Customers say the granola has big crunchy clusters, a good amount of almonds, and isn't too sweet for most people. Many eat it with yogurt or milk or by the handful as a snack. Some find it too sweet, and a few got a bag that was mostly crumbs.",
    aspects: [
      { name: "Taste", good: 640, bad: 90 },
      { name: "Crunch", good: 520, bad: 40 },
      { name: "Clusters", good: 410, bad: 120 },
      { name: "Sweetness", good: 210, bad: 160 },
    ],
    reviews: [
      { name: "Hailey N.", date: "2026-03-17", stars: 5, title: "Big clusters", text: "Big crunchy clusters, not just loose oats. Great on yogurt.", verified: true, helpful: 18 },
      { name: "Carol Y.", date: "2026-08-02", stars: 2, title: "Bag of crumbs", text: "My bag was crushed and it was mostly dust at the bottom. Tastes good, wish it had arrived in one piece.", verified: true, helpful: 15 },
      { name: "Javier S.", date: "2026-05-08", stars: 5, title: "Snack at work", text: "I keep a bag at my desk. The zipper actually reseals, which is rare.", verified: true, helpful: 6 },
      { name: "Molly R.", date: "2026-06-25", stars: 4, title: "A little sweet", text: "Good but a bit sweet for me, so I mix it with plain oats.", verified: true, helpful: 8 },
      { name: "Bernard C.", date: "2026-09-10", stars: 5, title: "Lots of almonds", text: "There are actually a good amount of almonds in it, not just a few slivers", verified: true, helpful: 7 },
      { name: "Nina T.", date: "2026-04-07", stars: 4, title: "Goes fast", text: "16 oz goes fast in our house. Wish they made a bigger bag.", verified: true, helpful: 4 },
      { name: "Frankie D.", date: "2026-07-23", stars: 5, title: "Crunchier than what I used to buy", text: "Fresher and crunchier than the granola I used to get at the grocery store.", verified: true, helpful: 2 },
      { name: "Ivy", date: "2026-10-13", stars: 5, title: "Kids love it", text: "my kids eat it like candy", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Is it gluten free?", a: "No. It contains oats that are processed in a facility that also handles wheat.", by: "Seller", date: "2026-03-25", votes: 12 },
      { q: "How sweet is it?", a: "medium sweet, like a honey cereal", by: "Molly", date: "2026-06-28", votes: 5 },
      { q: "Does it have raisins?", a: "no raisins, just oats and almonds", by: "Redbird Customer", date: "2026-08-14", votes: 3 },
    ],
  },

  'grocery-olive-oil': {
    summary: "Customers say the oil tastes fresh and a little peppery, works for both cooking and salad dressing, and is a good price for the size. Many like the dark glass bottle. Some had a bottle break in shipping, and a few say the spout drips down the side.",
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
      { name: "Bettina M.", date: "2026-09-08", stars: 3, title: "Drips", text: "The oil is good. The spout drips down the side every time so it leaves a ring on my counter.", verified: true, helpful: 12 },
      { name: "Omar F.", date: "2026-06-04", stars: 5, title: "Good for dipping bread", text: "Pour some on a plate with salt and pepper and dip bread in it. Simple and good.", verified: true, helpful: 5 },
      { name: "Clare", date: "2026-04-24", stars: 4, title: "Mild", text: "A little milder than I expected but good", verified: true, helpful: 3 },
      { name: "Renee A.", date: "2026-08-20", stars: 5, title: "Subscribed", text: "I get one a month on subscribe, saves a couple bucks.", verified: true, helpful: 4 },
      { name: "Jesse P.", date: "2026-10-01", stars: 5, title: "Good", text: "Good stuff", verified: true, helpful: 0 },
    ],
    questions: [
      { q: "Where are the olives from?", a: "Our olives are grown and pressed in the Mediterranean region. The country is printed on the back label.", by: "Seller", date: "2026-04-03", votes: 9 },
      { q: "Is there a harvest date?", a: "yes on the back label near the bottom", by: "Lucia", date: "2026-05-09", votes: 6 },
      { q: "Is it ok for high heat cooking?", a: "I use it for sauteing and roasting at 425 no problem", by: "Redbird Customer", date: "2026-07-16", votes: 4 },
    ],
  },

  'grocery-sparkling-water': {
    summary: "Customers say the lime flavor is light and refreshing and the cans are very fizzy right after opening. Many drink it to cut back on soda. Some say the flavor is too faint, a few got dented or leaking cans, and others say it goes flat quickly.",
    aspects: [
      { name: "Flavor", good: 1420, bad: 620 },
      { name: "Fizziness", good: 1210, bad: 240 },
      { name: "Value", good: 980, bad: 70 },
      { name: "Packaging", good: 90, bad: 280 },
    ],
    reviews: [
      { name: "Gabriela T.", date: "2026-05-25", stars: 5, title: "Helped me quit soda", text: "I used to drink 3 sodas a day. Switched to this and haven't had one in a month. Lime is just enough flavor.", verified: true, helpful: 33 },
      { name: "Tom H.", date: "2026-07-20", stars: 2, title: "Barely tastes like lime", text: "Tastes like plain sparkling water with a lime somewhere in the next room", verified: true, helpful: 48 },
      { name: "Redbird Customer", date: "2026-08-29", stars: 1, title: "Dented cans, one leaked", text: "3 cans were dented and one leaked all over the box. The cardboard was soaked when it showed up.", verified: true, helpful: 21 },
      { name: "Kiara J.", date: "2026-06-08", stars: 5, title: "Very fizzy", text: "Very bubbly when you first open it. Cold out of the fridge it's great.", verified: true, helpful: 7 },
      { name: "Sam O.", date: "2026-04-16", stars: 4, title: "Goes flat fast", text: "Fizzy at first but it goes flat quicker than I'd like if you don't finish the can.", verified: true, helpful: 6 },
      { name: "Derrick L.", date: "2026-09-03", stars: 4, title: "Wish it came in bigger packs", text: "We go through 12 cans in 3 days. Subscribe and save helps", verified: true, helpful: 4 },
      { name: "Pearl W.", date: "2026-03-27", stars: 5, title: "Nice with dinner", text: "Pour it over ice with a slice of real lime and it feels like a fancy drink.", verified: true, helpful: 3 },
      { name: "Alma", date: "2026-10-09", stars: 5, title: "Good price", text: "good price for 12", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Is it sweetened with anything?", a: "no sweetener at all, just lime flavor", by: "Gabriela", date: "2026-06-01", votes: 12 },
      { q: "Does it have sodium?", a: "No. There is no sodium in this sparkling water.", by: "Seller", date: "2026-04-22", votes: 8 },
      { q: "Are the cans BPA free?", a: "not sure, didn't see it on the box", by: "Redbird Customer", date: "2026-08-05", votes: 2 },
    ],
  },

  // ── Toys & games ─────────────────────────────────────────────────────────
  'cobble-blocks-set': {
    summary: "Customers say the blocks are sturdy, the colors are bright, and kids keep coming back to them. Many say the paint has held up to chewing and throwing. A few say some blocks had rough edges or chipped paint, and that the set comes in a bag with no storage box.",
    aspects: [
      { name: "Quality", good: 640, bad: 40 },
      { name: "Play value", good: 590, bad: 20 },
      { name: "Paint", good: 410, bad: 70 },
      { name: "Storage", good: 30, bad: 150 },
    ],
    reviews: [
      { name: "Erica S.", date: "2026-03-06", stars: 5, title: "Played with them for hours", text: "My 3 year old built towers for 2 hours straight the first day. Bright colors and the wood feels solid.", verified: true, helpful: 37, photo: 0 },
      { name: "Tara N.", date: "2026-05-18", stars: 2, title: "Rough edges and chipped paint", text: "A few blocks had rough edges I had to sand down, and the paint chipped on 3 of them in the first week. Not great for a toddler toy.", verified: true, helpful: 26, photo: 1 },
      { name: "Andrew L.", date: "2026-07-21", stars: 5, title: "Grandkids love them", text: "We keep them at our house for when the grandkids visit. The 3 year old and the 6 year old both play with them.", verified: true, helpful: 9 },
      { name: "Shanice B.", date: "2026-04-10", stars: 4, title: "No storage box", text: "Great blocks but they come in a plastic bag. Had to buy a bin for them", verified: true, helpful: 14 },
      { name: "Paul K.", date: "2026-08-26", stars: 5, title: "Survived my twins", text: "Two 4 year olds throwing them at each other and they're still in one piece. The blocks and the twins.", verified: true, helpful: 18 },
      { name: "Lars E.", date: "2026-06-12", stars: 5, title: "Good mix of shapes", text: "Arches, cylinders, triangles, not just squares. The kids build way more interesting stuff.", verified: true, helpful: 6 },
      { name: "Rocío V.", date: "2026-09-29", stars: 5, title: "Preschool teacher here", text: "Bought 2 sets for my preschool classroom. Holding up with 15 kids using them every day.", verified: true, helpful: 11 },
      { name: "Mina H.", date: "2026-02-17", stars: 5, title: "Nice gift", text: "good quality wood, nice gift", verified: true, helpful: 3 },
    ],
    questions: [
      { q: "Is the paint safe if my kid chews on them?", a: "Yes. The blocks are finished with water-based, non-toxic paint that is safe for children.", by: "Seller", date: "2026-03-15", votes: 23 },
      { q: "How big are the blocks?", a: "the basic square is about 1 inch on each side", by: "Erica", date: "2026-03-20", votes: 7 },
      { q: "Do they come with a box?", a: "no, plastic bag", by: "Redbird Customer", date: "2026-04-13", votes: 9 },
    ],
  },

  'cobble-puzzle': {
    summary: "Customers say the puzzle is sturdy, the pieces are big enough for small hands, and kids learn country names while they play. Many bought it as a gift. Some say small countries are grouped together on one piece, and a few found it too easy for kids older than 7.",
    aspects: [
      { name: "Learning", good: 280, bad: 20 },
      { name: "Quality", good: 260, bad: 25 },
      { name: "Difficulty", good: 120, bad: 80 },
      { name: "Accuracy", good: 60, bad: 50 },
    ],
    reviews: [
      { name: "Kristina O.", date: "2026-05-03", stars: 5, title: "My daughter knows the continents now", text: "My 5 year old does this every weekend and now she points out countries on the news. Pieces are thick and easy to pick up.", verified: true, helpful: 22 },
      { name: "Redbird Customer", date: "2026-07-08", stars: 3, title: "Too easy for older kids", text: "My 8 year old finished it in 10 minutes and was done with it. Better for 5 and 6", verified: true, helpful: 13 },
      { name: "Vikram S.", date: "2026-08-16", stars: 4, title: "Small countries are grouped", text: "Not every country is its own piece, the small ones are grouped together on bigger pieces. Makes sense for 48 pieces, just know that going in.", verified: true, helpful: 15 },
      { name: "Maureen D.", date: "2026-03-19", stars: 5, title: "Birthday gift", text: "Gave it to my nephew for his 6th birthday and his mom says he does it every day.", verified: true, helpful: 5 },
      { name: "Luca B.", date: "2026-06-27", stars: 5, title: "Nice wood", text: "Sturdy wood, bright colors, and the names are printed clearly.", verified: true, helpful: 4 },
      { name: "Teresa F.", date: "2026-09-23", stars: 4, title: "Printing slightly off", text: "The country names on a couple of pieces are a little off center. Kids don't notice", verified: true, helpful: 3 },
      { name: "Abel M.", date: "2026-04-29", stars: 5, title: "Homeschool", text: "We use it in our homeschool geography lessons. Holds up well.", verified: true, helpful: 6 },
      { name: "Ji-ho K.", date: "2026-10-15", stars: 5, title: "Great for learning", text: "Great for learning", verified: true, helpful: 2 },
    ],
    questions: [
      { q: "Are the country names printed on the pieces?", a: "Yes. The country names are printed on the pieces.", by: "Seller", date: "2026-04-01", votes: 7 },
      { q: "Is there a board or tray?", a: "yes there's a wooden tray with the outline of the map", by: "Kristina", date: "2026-05-10", votes: 6 },
      { q: "Is it ok for a 4 year old?", a: "my 4 year old needed help but liked it", by: "Redbird Customer", date: "2026-07-30", votes: 4 },
    ],
  },
};
