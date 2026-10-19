/**
 * Article bodies. Written out rather than generated: a journal whose prose is filler undermines
 * the one thing the design is claiming, which is that somebody cared about the content.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "pull"; text: string }
  | { type: "figure"; kind: "section"; caption: string }
  | { type: "dimension"; value: string; caption: string }
  | { type: "note"; text: string }

export const BODIES: Record<string, readonly Block[]> = {
  "what-the-fins-are-for": [
    {
      type: "p",
      text: "The fins on the south elevation of the building in this issue's cover study are 140 millimetres deep and spaced at 820 centres. Nobody chose those numbers for how they look. They are the output of a cooling load calculation run in the second month of the project, before the practice had drawn an elevation at all, and they are the reason the plant room is one storey rather than two.",
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
      text: "There is a second calculation that almost nobody runs, which is what the fins cost to clean. The practice that designed the cover study specified an access rail at the head of each bay, and it was value-engineered out in the final package. Four years in, the south elevation is grey at the top and pale at the bottom, in a gradient you can read from the street, and it is the most honest thing about the building.",
    },
    { type: "h", text: "What the drawings do not say" },
    {
      type: "p",
      text: "Ask three practices for a shading strategy and you will get three elevations and no numbers. Ask for the cooling load with and without, and two of the three will send it the next week, which tells you they had it all along and did not think you wanted it. The third will not send it at all.",
    },
    {
      type: "p",
      text: "That is the gap this journal keeps returning to. The quantities exist, they are produced early, and they decide the thing the photographs are of. They are simply not what anyone publishes.",
    },
    {
      type: "note",
      text: "The cover study is a fiction, but the proportions and the fin spacing are taken from a real civic building completed in 2019. The practice asked not to be named.",
    },
  ],

  "the-ninety-centimetre-lie": [
    {
      type: "p",
      text: "Eleven civic buildings, all completed since 2015, all on a plinth. The heights run from 600 millimetres to 1.4 metres and cluster hard at 900. When we asked the architects why, nine said some version of presence, two said drainage, and none could produce a drawing where the decision was made.",
    },
    {
      type: "p",
      text: "The ramp is the tell. In all eleven buildings the ramp is longer than the stair, set to one side, and arrives at a different door. In seven it was added after planning. A plinth is a decision about who arrives at the front and who arrives at the end of a slope, and it is almost always taken before anyone has drawn the slope.",
    },
    {
      type: "figure",
      kind: "section",
      caption:
        "The cover study carries the same 900. Cut through it and the plinth stops being a base and becomes what it is: a floor level that the ground has to climb to.",
    },
    {
      type: "pull",
      text: "A plinth decides who arrives at the front and who arrives at the end of a slope. It is almost always drawn before the slope is.",
    },
    {
      type: "p",
      text: "None of this is an argument against raising a floor. There are sites where 900 millimetres is a flood level and buildings where the plinth is the only thing holding a terrible street together. It is an argument against drawing it first and justifying it afterwards, which is what the survey found in every case where the practice still had the early models.",
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
      type: "p",
      text: "The arithmetic that follows is unforgiving and widely ignored. A new frame of the same span carries roughly four times the embodied carbon of the one being removed, before anything is clad. Reuse closes that gap entirely and opens a different one, in programme and in risk, which is where the conversation always stops.",
    },
  ],

  "drawing-the-datum": [
    {
      type: "p",
      text: "Before anything on a site can be measured, something has to be declared level. The datum is a fiction agreed between a surveyor and a drawing, and every dimension on every sheet afterwards is relative to it. Choosing where to put it is the first design decision on any project, and it is usually made by whoever opens the file.",
    },
    {
      type: "p",
      text: "Put it at the existing ground and the building reads as sitting in the site. Put it at the finished floor and the ground becomes something to be adjusted. Put it at sea level, as the infrastructure engineers will want, and the whole discussion moves into a register where nobody argues about thresholds any more.",
    },
    {
      type: "figure",
      kind: "section",
      caption:
        "Everything in the cover study is measured from a line 900 millimetres below the plinth top. Move the cut and watch what the line does to the reading of the ground.",
    },
    {
      type: "p",
      text: "The journal is named for it because the choice is invisible, consequential, and made early — which is the description of almost every decision we are interested in.",
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
      type: "pull",
      text: "The buildings that disprove the rule are the ones with enormous plant: the argument was lost, and the loss is being paid in electricity for sixty years.",
    },
    {
      type: "p",
      text: "Orientation is free and is set in the first week. Mass is cheap and is set in the first month. Openings are expensive and are argued about for a year. We spend our attention in exactly the reverse order of the leverage available, which is the single most reliable finding across every project this journal has looked at.",
    },
  ],
}
