/**
 * Article bodies. Written out rather than generated: a journal whose prose is filler undermines
 * the one thing the design is claiming, which is that somebody cared about the content.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "pull"; text: string }
  | { type: "figure"; kind: "section" | "elevation" | "ar"; caption: string }
  | { type: "levels" }
  | { type: "approach" }
  | { type: "programme" }
  | { type: "overhang" }
  | { type: "survey" }
  | { type: "dimension"; value: string; caption: string }
  | { type: "note"; text: string }

export const BODIES: Record<string, readonly Block[]> = {
  "what-the-fins-are-for": [
    {
      type: "p",
      text: "The fins on the south elevation of the building in this issue's cover study are {{finDepth}} deep and spaced at {{finPitch}} centres. Nobody chose those numbers for how they look. They are the output of a cooling load calculation run in the second month of the project, before the practice had drawn an elevation at all, and they are the reason the plant room is one storey rather than two.",
    },
    {
      type: "p",
      text: "This is the part of the brise-soleil that does not survive the magazine photograph. A shading device is an instrument for moving money from the facade budget to the mechanical budget, or the other way round, and the exchange rate is set by the sun angle at the hour the building is fullest. Everything else — the rhythm, the material, the way the shadows rake across the wall at four in the afternoon — is what you get to design once the depth is fixed.",
    },
    { type: "h", text: "The number comes from the section" },
    {
      type: "p",
      text: "Work it the other way and the absurdity is obvious. Draw a beautiful screen, then ask what it does at the summer solstice, and you will find it either shades the glass at noon and blinds the room at five, or it does neither and costs the same. The section is where the answer lives, because the section is the only drawing that shows the sun arriving at an angle.",
    },
    { type: "figure", kind: "elevation", caption: "" },
    {
      type: "figure",
      kind: "section",
      caption:
        "Drag the cut through the model. The fins only make sense once the plane is far enough east to show the overhang and the floor behind it in the same view.",
    },
    {
      type: "pull",
      text: "A shading device is an instrument for moving money between two budgets. The exchange rate is the sun angle at the hour the building is fullest.",
    },
    {
      type: "p",
      text: "There is a second calculation that almost nobody runs, which is what the fins cost to clean. The practice that designed the cover study specified an access rail at the head of each of the {{finCount}} bays, and it was value-engineered out in the final package. Four years in, the south elevation is grey at the top and pale at the bottom, in a gradient you can read from the street, and it is the most honest thing about the building.",
    },
    { type: "h", text: "Who actually set the geometry" },
    {
      type: "p",
      text: "Ask who designed the screen and you will be told the name of the practice. Ask who set the depth and the spacing and the answer, on this building and on most of them, is a services engineer in month two, working from a cooling load and a shading target, in a spreadsheet nobody kept.",
    },
    {
      type: "p",
      text: "This is not a complaint about engineers. The calculation is the right way to arrive at the number, and the number is good: the screen cuts peak solar gain on the south face by a bit over half, which is what took the plant room from two storeys to one. The complaint is that the output of that calculation arrived in the architectural model as a geometry with no note attached, and from that moment it was treated as a given rather than as a result.",
    },
    {
      type: "p",
      text: "You can tell, because of what happened next. The depth survived three facade revisions unchanged. The spacing survived a change of structural grid. Both are quantities that should move when the thing around them moves, and neither did, because nobody in the room knew what they were a consequence of. A number with its reasoning stripped off is indistinguishable from a decision, and gets defended like one.",
    },
    {
      type: "pull",
      text: "A number with its reasoning stripped off is indistinguishable from a decision, and gets defended like one.",
    },
    { type: "h", text: "What the drawings do not say" },
    {
      type: "p",
      text: "Ask three practices for a shading strategy and you will get three elevations and no numbers. Ask for the cooling load with and without, and two of the three will send it the next week, which tells you they had it all along and did not think you wanted it. The third will not send it at all.",
    },
    {
      type: "p",
      text: "The elevations are not useless. They are just answering a different question. An elevation is a statement about composition — rhythm, proportion, where the eye rests — and on a screen like this one it is the drawing that cannot show the thing the screen is for. A fin seen square on is a line. Its depth, which is the entire mechanism, projects toward you and collapses to nothing.",
    },
    {
      type: "p",
      text: "That is the gap this journal keeps returning to. The quantities exist, they are produced early, and they decide the thing the photographs are of. They are simply not what anyone publishes.",
    },
    {
      type: "p",
      text: "Which is the limit of a page. An elevation flattens the {{finDepth}} to a line, a section cuts it, and neither performs the move the argument needs, which is walking round the thing. The last plate is therefore not a drawing.",
    },
    { type: "figure", kind: "ar", caption: "" },
    {
      type: "note",
      text: "The cover study is a fiction, but the proportions and the fin spacing are taken from a real civic building completed in 2019. The practice asked not to be named.",
    },
  ],

  "the-ninety-centimetre-lie": [
    {
      type: "p",
      text: "Eleven civic buildings, all completed since 2015, all on a plinth. The heights run from 600 millimetres to 1.4 metres and cluster hard at {{plinthHeight}}. When we asked the architects why, nine said some version of presence, two said drainage, and none could produce a drawing where the decision was made.",
    },
    { type: "survey" },
    {
      type: "p",
      text: "That last part is the finding. Not that the plinth is wrong — it is often right — but that in eleven out of eleven cases it arrived before the reason for it. We asked for the earliest model each practice still held. In eight the plinth is already there, at its final height, in a file dated before the first client workshop. In two it appears between the workshop and the planning submission. In one the practice could not find anything earlier than the tender set, which we have counted as unknown rather than as evidence.",
    },
    {
      type: "p",
      text: "A raised floor does real work. It keeps water out, it hides the servicing that would otherwise occupy a ceiling, it gives a level threshold across a sloping site, and it separates a building from a car park. Every one of those is a reason you can draw. What none of them explains is the clustering. Flood levels do not cluster. Site falls do not cluster. Service zones vary with the system. A number that is the same in nine buildings on nine different sites is not responding to the sites.",
    },
    {
      type: "pull",
      text: "Flood levels do not cluster. A number that is the same on nine different sites is not responding to the sites.",
    },
    { type: "h", text: "What the ramp tells you" },
    {
      type: "p",
      text: "The ramp is the tell. In all eleven buildings the ramp is longer than the stair, set to one side, and arrives at a different door. In seven it was added after planning. A plinth is a decision about who arrives at the front and who arrives at the side, and it is taken before anyone has said that out loud.",
    },
    {
      type: "p",
      text: "This is where the heights stop being an abstraction. At {{plinthHeight}} a ramp at the maximum gradient permitted for a public approach needs a little over eighteen metres of run, plus landings. Eighteen metres has to go somewhere. In four of the eleven it goes along the front, so the main elevation is read across a handrail. In five it goes down the side, out of the photographs. In two it was value-engineered into a platform lift, which is a cupboard with a button, and which was out of service on the day we visited one of them.",
    },
    { type: "approach" },
    {
      type: "p",
      text: "None of those outcomes was designed. They are all consequences of a height nobody can account for, resolved years later by whoever had the drawing open. The practices were not careless. Three of them are very good. The decision simply never presented itself as a decision, because it was made by a default rather than by an argument, and defaults do not generate minutes.",
    },
    { type: "h", text: "The height is the brief nobody wrote" },
    {
      type: "p",
      text: "We put the clustering to four of the eleven practices. Two recognised it immediately and said, in almost the same words, that it is what a civic building looks like. One said their model template opens with the ground slab at that level and has done since a project in 2011. The fourth asked to see the survey before commenting and then did not comment.",
    },
    {
      type: "p",
      text: "The template answer is the honest one and the most interesting. A default inside a file is a brief that nobody wrote, agreed to, or can be held to. It survives staff turnover, it crosses between unrelated projects, and it is invisible in every drawing it produces, because a drawing shows what was decided and not what was never questioned.",
    },
    {
      type: "pull",
      text: "A default inside a file is a brief nobody wrote, agreed to, or can be held to — and it is invisible in every drawing it produces.",
    },
    {
      type: "p",
      text: "The cover study carries the same {{plinthHeight}}. Cut through it and the plinth stops being a base and becomes what it is: a floor level that the ground has to climb to.",
    },
    {
      type: "p",
      text: "None of this is an argument against raising a floor. There are sites where {{plinthHeight}} is a flood level and buildings where the plinth is the only thing holding a terrible street together. It is an argument against drawing it first and justifying it afterwards, which is what the survey found in every case where the practice still had the early models.",
    },
    {
      type: "p",
      text: "The test is cheap. Open the earliest file. If the floor level is already there, it was not designed — it was inherited, and the ramp you are about to spend four months on is the interest payment.",
    },
    {
      type: "note",
      text: "Eleven buildings, all publicly funded, all in the United Kingdom and Ireland, completed between 2015 and 2024. Early models were supplied by eight of the eleven practices on the condition that neither buildings nor practices are named.",
    },
  ],

  "concrete-remembers": [
    {
      type: "p",
      text: "Three buildings, all being taken apart rather than knocked down, all in the same eighteen months. Demolition is the only phase of the life cycle nobody draws, and standing inside one is the fastest way to find out what a building was actually made of, as opposed to what the specification said.",
    },
    {
      type: "p",
      text: "The first thing you notice is how little of it can come back. Not for technical reasons — the frames in two of the three were sound enough to re-erect — but because nobody can certify a beam whose history is a scan of a 1974 drawing and a surveyor's opinion. The carbon is in the frame. The paperwork is why it goes in a skip.",
    },
    {
      type: "pull",
      text: "The carbon is in the frame. The paperwork is why it goes in a skip.",
    },
    {
      type: "dimension",
      value: "× 4",
      caption:
        "The embodied carbon of a new frame of the same span, against the frame being removed, before anything is clad",
    },
    {
      type: "p",
      text: "The arithmetic that follows is unforgiving and widely ignored. A new frame of the same span carries roughly four times the embodied carbon of the one being removed, before anything is clad. Reuse closes that gap entirely and opens a different one, in programme and in risk, which is where the conversation always stops.",
    },
    { type: "h", text: "What a beam has to prove" },
    {
      type: "p",
      text: "To put a reclaimed steel section back into a building you need to know what it is. Not approximately — you need a grade, and a grade is a claim about chemistry and about how the metal behaves after it yields. A section rolled before the mid-1970s was made to a standard that no longer maps cleanly onto the one the engineer is designing to, and the mill certificate, if it ever existed, went with the contractor who went into administration in 1991.",
    },
    {
      type: "p",
      text: "So you test. Testing means cutting coupons out of the member, which means the member is shorter, which means either the grid changes or the coupon comes from the part you were going to cut off anyway, which is the part that tells you least. Three coupons per batch is the usual ask. On the second of the three buildings that came to eleven thousand pounds of testing to release about sixty tonnes of steel, and the number that made it work was not the carbon. It was that the replacement sections had a fourteen-week lead time and the testing took three.",
    },
    { type: "programme" },
    {
      type: "p",
      text: "Concrete is worse, because concrete does not come apart. A reinforced frame is a single object that happens to have been poured in stages. You can cut it, and people do, but what you recover is a slab fragment with unknown reinforcement, unknown cover and a cut face that was never meant to be an edge. The second building gave up eleven hundred square metres of sound slab. All of it was crushed.",
    },
    {
      type: "pull",
      text: "Eleven hundred square metres of sound slab. All of it was crushed, and the crushing was the responsible option on every measure except the one that matters.",
    },
    { type: "h", text: "Risk has an owner and carbon does not" },
    {
      type: "p",
      text: "Every structural engineer we spoke to during the three projects gave a version of the same answer. They are not against reuse. They are against signing for a member whose provenance is a photograph. The liability for a frame sits with one named individual for the life of the building, and that individual has no mechanism for sharing it with the 1974 fabricator.",
    },
    {
      type: "p",
      text: "Embodied carbon has no such owner. It is counted in a report, compared against a target, and reported to a client who has already paid for the building. Nobody is personally liable for it, nobody is sued over it, and no professional indemnity policy has ever been triggered by it. Put an unowned cost next to an owned risk and the outcome is not in doubt — and it is not, in the strict sense, irrational. It is what the incentives say.",
    },
    {
      type: "p",
      text: "Which is why the interesting work on reuse is not technical. The engineering was solved on the second building in about a fortnight. What took nine months was arranging for the testing regime to be agreed with the approving authority before demolition began rather than after, so that the steel was characterised while it was still standing and still had drawings attached to it.",
    },
    {
      type: "p",
      text: "That is the whole intervention: move the paperwork earlier. It saved sixty tonnes. On the first building, where it was attempted after the frame came down and the members were in a yard with their connections cut off, it saved nothing at all, and the carbon case was identical.",
    },
    {
      type: "note",
      text: "Three projects, visited between March 2025 and August 2026, two in England and one in the Netherlands. Costs are as reported by the contractors and have not been independently audited.",
    },
  ],

  "drawing-the-datum": [
    {
      type: "p",
      text: "Before anything on a site can be measured, something has to be declared level — on the cover study, {{plinthHeight}} below the plinth top. The datum is a fiction agreed between a surveyor and a drawing, and every dimension on every sheet afterwards is relative to it. Choosing where to put it is the first design decision on any project, and it is usually made by whoever opens the file.",
    },
    {
      type: "p",
      text: "Put it at the existing ground and the building reads as sitting in the site. Put it at the finished floor and the ground becomes something to be adjusted. Put it at sea level, as the infrastructure engineers will want, and the whole discussion moves into a register where nobody argues about thresholds any more.",
    },
    {
      type: "figure",
      kind: "section",
      caption:
        "Everything in the cover study is measured from a line {{plinthHeight}} below the plinth top. Move the cut and watch what the line does to the reading of the ground.",
    },
    { type: "h", text: "Zero is a position" },
    {
      type: "p",
      text: "Nobody writes down which of those three they chose, because it does not feel like a choice. It feels like setting up the file. But the choice decides what is easy to see later. Dimension from the finished floor and every cut-and-fill question becomes an addition you have to perform; dimension from existing ground and the floor level is the thing that has to justify itself on every sheet. The drawing makes one of those questions free and the other one effortful, and over eighteen months the free question gets asked a hundred times and the effortful one gets asked twice.",
    },
    {
      type: "pull",
      text: "The drawing makes one question free and the other effortful. Over eighteen months the free one gets asked a hundred times.",
    },
    {
      type: "p",
      text: "This is not a metaphor about drawings. It is a description of where the numbers live. A level is only ever a difference between two things, and the datum decides which of them you have to think about.",
    },
    { type: "h", text: "The handover problem" },
    {
      type: "p",
      text: "A datum also has to survive being handed over. On a project of any size there are at least four of them in play: the architect's, which is usually the finished floor; the engineer's, which is usually the top of the structural slab, a construction depth lower; the surveyor's, which is a national grid level; and the contractor's peg, which is a mark on a wall at the edge of the site and is the only one anybody actually builds to.",
    },
    { type: "levels" },
    {
      type: "p",
      text: "Each conversion is a subtraction, and each subtraction is a place to be out by the depth of a screed. We have seen this go wrong twice at the same point: a drainage invert set from the structural datum against a threshold set from the finished floor, discovered when the water went the wrong way across a terrace. Both times the drawings were individually correct. Neither set said which zero it was using, because both thought it was obvious.",
    },
    {
      type: "p",
      text: "The fix is one line of text on every sheet, naming the datum and its relationship to the national grid. Almost nobody prints it. It is the cheapest piece of information in the set and the only one that makes all the others legible.",
    },
    { type: "h", text: "Why the journal is named for it" },
    {
      type: "p",
      text: "The journal is named for it because the choice is invisible, consequential, and made early — which is the description of almost every decision we are interested in.",
    },
    {
      type: "p",
      text: "There is a second reason, which is that a datum is an admission. Declaring a line level is declaring that it is not, in fact, level in any absolute sense; the ground falls away, the sea moves, the whole thing is an agreement made in order to get on with the work. A profession that was comfortable saying that out loud about its floor levels might be more comfortable saying it about the rest.",
    },
    {
      type: "note",
      text: "The cover study places the datum at the underside of the plinth rather than at its top, so that the figure most often quoted about the building — its height above the ground — is the first dimension on the sheet rather than a subtraction.",
    },
  ],

  "a-thermal-argument": [
    {
      type: "p",
      text: "A building is a thermal argument with three terms: which way it faces, how much mass it has, and where the openings are. Everything after that is commentary. The cladding is commentary. The render is commentary. The award is commentary on the commentary.",
    },
    {
      type: "p",
      text: "This sounds reductive until you try to find a building where it is false. The ones that come to mind are the ones with enormous plant, which is to say the ones where the argument was lost and the losses are being paid for in electricity, quietly, for sixty years.",
    },
    {
      type: "dimension",
      value: "60 years",
      caption:
        "How long a lost thermal argument is paid for in electricity, after everyone who lost it has been paid",
    },
    {
      type: "pull",
      text: "The buildings that disprove the rule are the ones with enormous plant: the argument was lost, and the loss is being paid in electricity for sixty years.",
    },
    {
      type: "p",
      text: "Orientation is free and is set in the first week. Mass is cheap and is set in the first month. Openings are expensive and are argued about for a year. We spend our attention in exactly the reverse order of the leverage available, which is the single most reliable finding across every project this journal has looked at.",
    },
    { type: "h", text: "Free, cheap, expensive" },
    {
      type: "p",
      text: "Take the three in order. Rotating a block on a loose site costs a drawing. On a tight urban site it costs nothing at all, because the rotation is already fixed by the street and the only decision left is which rooms face which way — also a drawing. The cost of getting orientation right is the cost of thinking about it on the correct afternoon.",
    },
    {
      type: "p",
      text: "Mass costs a little more. A heavier floor build-up or an exposed soffit in place of a suspended ceiling is a real decision with a real price, and it conflicts with acoustics and with services routing. But it is a decision about a build-up, taken once, early, and it is substantially cheaper than the plant it displaces.",
    },
    {
      type: "p",
      text: "Openings are where the money is, and they are where the argument happens. Every window is a negotiation between daylight, view, heat loss, solar gain, fire, security, cleaning and planning. There is no right answer, which is exactly why it absorbs a year: it is the term that rewards discussion, so it gets all of it.",
    },
    { type: "h", text: "The cover study, specifically" },
    {
      type: "p",
      text: "The cover study is a worked example of the inversion. Its fins are {{finDepth}} deep at {{finPitch}} centres across a reading room {{slabWidth}} wide, and that geometry was fixed in month two by a cooling load calculation, before anyone had drawn the elevation it now defines. It is the cheapest decision in the project and the one you photograph.",
    },
    {
      type: "p",
      text: "The study tower stands {{towerHeight}} and the upper floor cantilevers {{overhang}} west past the room below it. That was a planning move. It also shades, because a horizontal thing over a window always does, and it cost nothing because it was already there. It is not in the energy model, which assumed a flat facade.",
    },
    { type: "overhang" },
    {
      type: "p",
      text: "Draw the shade and the free lunch turns into the standard argument against horizontal devices on a west face. At midday the overhang covers the top two metres of the glass. By six, when the west sun is doing its actual damage, it covers eleven centimetres. A projection fails exactly as the sun it is shading from gets low, which is why a west elevation wants vertical fins and a south elevation wants a brise-soleil — and why the cover study has its fins on the wrong wall to help here.",
    },
    {
      type: "pull",
      text: "The shade was free, and it fails at the hour it is needed. Neither fact is in the model, because the model was built from an elevation and an elevation does not know what projects.",
    },
    { type: "h", text: "Why the order persists" },
    {
      type: "p",
      text: "If the leverage is so lopsided, why does nobody reorder the work? Because the three terms differ in how visible they are to a client. Orientation and mass are invisible at the stage they are decided; there is nothing to present. Openings produce images. A fee structure that pays for stages, and a client who approves what they can see, will pull attention toward the term that photographs — and that term is the one with the least leverage per hour spent on it.",
    },
    {
      type: "p",
      text: "The practices that escape it do one thing in common, and it is not virtue. They produce a number in the first fortnight — a peak load, a glazing ratio, a free-running hours count — and they put it in front of the client before there is an image to look at. Once a number is on the table it has to be argued with, and arguing with it is the design.",
    },
    {
      type: "p",
      text: "That is the whole method, and it is the reason this journal publishes the quantities. Not because numbers are more honest than drawings, but because a number asked for in week two changes a building and the same number produced in month fourteen is a report.",
    },
    {
      type: "note",
      text: "The cover study is a fiction. The pattern it illustrates is drawn from eleven projects where this journal was able to see both the early energy work and the final package.",
    },
  ],
}
