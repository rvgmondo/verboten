> Prepared for Verboten Spirits (Verboten Pty Ltd), Silverton, Pretoria.
> Everything below is text you paste into an image tool. Nothing here generates an image for you.
> Palette used throughout: champagne gold `#CDB88D`, near-black `#141414`, cream `#F5F1E6`. These are the values in your site build (`C:\CC\verboten\src\app\globals.css`), not a signed-off brand standard. If you hold real brand colour specs from whoever set the identity, check these against them before you generate a hundred images around them.

---

## 0. Read this first

Whoever wrote this pack cannot make images. What you are holding is a set of instructions written for image tools, plus an honest account of where those tools will let you down. You still have to open a tool, paste, generate, judge the result, and throw most of them away. Budget the time.

What I found while checking your existing files, before you spend a cent:

**Your product images are small.** `C:\CC\verboten\media\verboten-premium-brandy-batch-no-01-3-year-1.jpg` is 1024 x 1024 and about 30KB. The two bottle set, `batch-no-01-premium-set-2-bottle-1.jpg`, is also 1024 x 1024 at about 59KB. The can, `verboten-brandy-cola-1.png`, is 1066 x 1066 but a PNG at about 1.4MB, so it holds detail better on screen while still being short of pixels. All three are web exports, not camera files. They are fine as reference images for AI, and fine as the base for background replacement at web size. They are not enough for a marketplace listing at 1500px, and not enough for any crop that goes close on the label. **Get the original full resolution files from whoever took the studio shots before you do anything else.** That one email is worth more than the rest of this document.

**There are no event photographs in the project.** The only images in `C:\CC\verboten\media\` are the three product shots and their resized derivatives. Section 3.4 and Recipe 2 both assume you have real event photographs. If those exist, they are on a phone, a hard drive, or somebody else's camera. Find them and copy them into the project before you plan any work around them. If they do not exist, say so out loud, because a chunk of this pack is then aspirational rather than actionable.

**Your filenames say `batch-no-01`.** The brand rule is no batch numbering, products are permanent. Either the label genuinely carries a batch number and the rule needs revisiting, or the filenames and product titles need cleaning up. Worth deciding before you generate a hundred new assets around the same naming.

**Your crest file is tiny.** `C:\CC\verboten\public\brand\crest.png` is 224 x 221 and about 7KB. `badge.png` is 640 x 640. Those are screen assets. If you ever need the crest placed into an image at any real size, you need the vector original, not an upscale and never a generated version.

**Brandy & Cola shows as out of stock** until stock is set in the admin. Nothing in this pack depends on that, but do not spend an evening on can imagery and then find the product still cannot be bought.

**Where to save output.** Keep AI output away from your real photographs. Make `C:\CC\verboten\media\ai\` and work there. It does not exist yet. Never overwrite a real photograph with a generated version of it. Keep the untouched original of every event photo you edit.

### If you only do five things this month

1. Get the original studio files from the photographer, and the vector crest while you are asking.
2. Run the marketplace white background conversion (Section 4, Recipe 5). That is the one with revenue attached.
3. Run one hero (H1) and one texture plate (H2) so the homepage stops looking like a template.
4. Track down the event photographs, then convert three of them into usable posts (Section 4, Recipe 2).
5. Build the three serve images (S1, S2, S3). Those are the images people actually save and copy.

Everything else in this pack is there when you have a free evening.

---

## 1. How to use this

Three different things get called "AI image generation". They fail in different places, so knowing which one you need is most of the skill.

### Text-to-image: generate from nothing

You type words, the tool invents a picture. Nothing of yours goes in. Suited to moods, textures, empty bars, cocktail glasses, oak, weather, hands. Useless for your product, because the tool has never seen your bottle and will invent a label that looks almost right and is completely wrong.

*Tools:* any general generator. Midjourney, Adobe Firefly, Ideogram, and the many interfaces running Flux or Stable Diffusion models such as Freepik, Krea, or Replicate. Most run a free tier alongside a paid monthly plan, but limits and prices move around. Check the current terms on each tool's own site before you commit to one.

### Image-to-image and reference: feed in your own photo

You give the tool your bottle photograph plus words, and it makes a new picture that keeps your product and changes the world around it. This is the mode that keeps your label honest, but only if you hold the strength setting down. Every tool names the control differently: denoise strength, image weight, similarity, transformation amount. Low value means it stays close to your photo. High value means it invents freely.

**Rule of thumb: 0.20 to 0.35 denoise strength keeps a label readable and correct. Above 0.50 the tool starts redrawing your label and it will look wrong.** If your tool only offers a slider with no numbers, start at the most conservative quarter and creep up.

*Tools:* Stable Diffusion and Flux interfaces with a strength slider, Midjourney's image reference, and the newer conversational editors where you upload a photo and tell it what to change in plain English. Which of those the big providers currently offer changes month to month. Before you pay for a year, upload your bottle and test whether the label survives.

### Inpainting and outpainting: change part of a real photo

You paint a mask over the part of a real photograph you want changed, and describe what should be there instead. Outpainting is the same trick pointed outward: it extends the edges of a photo that is too tight to crop for a wide hero. This is the workhorse for your event photographs and for putting your real bottle into a scene it was never in.

*Tools:* Photoshop's generative fill, Firefly, Krea, or any Stable Diffusion or Flux interface with a mask brush. If you have no Photoshop, the browser based background removers (Photoroom, Canva, remove.bg) plus any generator will get you most of the way. Most of those run a free tier with limits on size or export, so check what the current tier gives you before you rely on it.

### Reading a prompt block in this pack

Every prompt below gives you:

- **Technique** so you know which of the three modes to open.
- **Label rule** stated per prompt, because this is where AI breaks.
- **Aspect** as a ratio. Midjourney style tools take `--ar 16:9` on the end. Others ask for pixel width and height. Convert as needed.
- **Prompt** in a code block, ready to paste whole.
- **Negative** where it helps. Some tools have no negative prompt field, in which case ignore it.
- **Check** which is the one thing to look at before you use the image anywhere.

### Save these two snippets

You will paste them constantly.

**BASE NEG** (paste into the negative prompt field on every generation)

```
text, lettering, typography, watermark, signature, logo, brand mark, garbled writing, extra fingers, malformed hands, deformed anatomy, plastic skin, cgi, 3d render, cartoon, illustration, oversaturated, hdr, neon colours, teal and orange grade, cluttered background, dirty glass, floating ice, impossible reflections, duplicated bottles, blurry, low resolution, children, teenagers, anyone under 25, car keys, car interior, road, driving, drunk behaviour, rows of empty glasses, plastic cups
```

**STYLE TAG** (append to any text-to-image prompt that needs to look like you)

```
low-key photographic lighting, deep shadows that keep detail, colour palette limited to near-black #141414, champagne gold #CDB88D and cream #F5F1E6, quiet and restrained mood, premium spirits photography, fine natural film grain, nothing shouting
```

### Compliance, baked in

Every prompt here already avoids the things that get alcohol content pulled down or complained about. Keep it that way when you edit them:

- No one who could read as under 25. Say "in their thirties" or "in their forties" in the prompt, or use hands only. Hands only is safer and often better.
- Never a vehicle, a road, keys, or a bicycle in frame with a drink.
- One or two drinks in shot. Never a table of empties, never a visibly drunk person.
- No link between drinking and sport, work success, courage, romance as a conquest, or coping with anything.
- Where the image carries a caption, the caption carries: **Drink responsibly. Not for sale to persons under 18.**
- Set the age restriction on every platform that offers one, on the profile and on individual posts. Alcohol is 18+ only.
- Do not generate a face that resembles a real famous person, and do not generate a recognisable named bar interior without that bar's permission.
- Do not generate a competitor's cola can. For the tall serve, keep cola in the glass and your own can in frame from your real photo.

---

## 2. The hard limit

**AI cannot reproduce your label, your crest, or your typography. Not now, not with a better prompt, not with more attempts.**

Image generators invent text. They will produce something that at a glance reads as a spirits label, in roughly your colours, with letters that are almost words. Zoom in and it is nonsense. The crest will be a different crest. The word VERBOTEN will have a letter missing or doubled. The 43% will become 4B%. On a phone at thumbnail size you might get away with it, and then someone screenshots it, or a retailer asks for the file at full size, and you have a fake bottle of your own product circulating.

This is not a small cosmetic problem. It is a trust problem for a brand whose whole promise is that nothing leaves the house unless it earns the label.

### The rule, in one line

**If the label is readable in the final image, that label must come from your real photograph. No exceptions.**

Which gives you exactly two safe routes for any product shot:

1. **Your photo is the base.** Image-to-image at low strength, or background replacement, or a straight composite. The label pixels are your camera's pixels.
2. **The label is not readable.** Fully generated is safe when the bottle is far away, thrown out of focus, cropped so the label is out of frame, silhouetted against a light source, turned away from camera, or simply absent from the shot.

Everything in the library below is tagged with which route it takes. Where a prompt is fully generated and there is a bottle in it, the prompt itself contains instructions to keep the bottle unlabelled, distant, or dark, and the negative prompt bans lettering. If a generated image comes back with legible text on a bottle, that image is unusable. Delete it, do not "just fix it later".

The same applies to the crest as a standalone graphic. If you need it in an image, place the real file, and get the vector before you place it at any size larger than the 224px PNG you currently have.

**One more honesty limit.** Generated images of stills, cellars, and casks show a production process that may not be yours. If Verboten distils and ages in Silverton, those images are a fair illustration and you should still label them as illustrations rather than passing them off as your cellar. If any part is contracted out, do not publish generated production imagery at all. That is a claim about how the product is made, and getting caught on it costs more than the images are worth. This is listed in Section 6 as an open question, and it needs a straight answer before Section 3.3 gets used.

---

## 3. The prompt library

### 3.1 Website hero

---

#### H1. Hero, the bottle in storm light

**Technique:** Image-to-image, your studio bottle shot on black as the reference. Strength 0.25 to 0.35.
**Label rule:** Safe. The label is your photograph's pixels. Verify at 200 percent zoom before publishing.
**Aspect:** 21:9 for desktop. Regenerate at 4:5 for mobile rather than cropping.

```
Keep the bottle exactly as it appears in the reference image, unchanged: same shape, same glass, same label, same crest, same typography, same proportions. Change only the environment and the light around it. Place the bottle on a raw poured concrete ledge in a dark room. Late afternoon Highveld storm light entering from a window high on the right, warm champagne gold #CDB88D rim light down the right edge of the glass, the left side of the bottle falling into near-black #141414. Soft dust in the air. A faint cream #F5F1E6 reflection on the wet concrete beneath the bottle. Shot on an 85mm lens at f/2.8, camera slightly below the shoulder of the bottle, shallow depth of field, background falling away into darkness. Wide horizontal composition with the bottle in the right third and empty dark space across the left two thirds for headline type. Quiet, still, a little dark. Fine natural film grain, photographic, not a render.
```

**Negative:** BASE NEG plus `redrawn label, altered label, different bottle shape, second bottle, studio softbox reflection, white background`

**Check:** Zoom to 200 percent on the label. If a single letter differs from your real bottle, lower the strength and run it again.

---

#### H2. Hero, oak texture plate, no product

**Technique:** Text-to-image. Nothing of yours goes in.
**Label rule:** Safe by absence. There is no bottle in this image.
**Aspect:** 21:9

```
Extreme close view of the charred end grain of a French oak cask, deep amber and near-black tones, one hard shaft of warm low light raking across the wood from the right, dust suspended in the beam, the char pattern reading like cracked leather, shallow depth of field on a 100mm macro lens at f/4, low-key photographic lighting, deep shadows that keep detail, colour palette limited to near-black #141414, champagne gold #CDB88D and cream #F5F1E6, quiet and restrained mood, premium spirits photography, fine natural film grain, wide horizontal composition with the wood filling the right two thirds and empty dark space on the left for headline type, nothing shouting
```

**Negative:** BASE NEG plus `barrel hoops with numbers, chalk writing, stencilled dates, whole barrel, wine cellar cliche, orange grade`

**Check:** No numbers or chalk marks anywhere on the wood. Batch numbering is off-brand and generators love adding it.

---

#### H3. Hero, Pretoria dusk, bottle silhouetted

**Technique:** Text-to-image. Safe because the bottle is a black shape against light.
**Label rule:** Safe by silhouette. If any label detail becomes visible, the image is unusable.
**Aspect:** 16:9

```
A dark spirits bottle standing in silhouette on a windowsill, photographed against a Pretoria dusk sky, jacaranda branches in soft silhouette beyond the glass, the sky graded from champagne gold #CDB88D at the horizon to deep near-black #141414 above, the bottle entirely dark with a single thin gold highlight running down its shoulder, no label visible at all, no lettering, backlit contre-jour photography, 50mm lens at f/2, warm haze, low-key photographic lighting, quiet and restrained mood, fine natural film grain, wide horizontal composition with the bottle in the left third and open sky on the right for headline type
```

**Negative:** BASE NEG plus `visible label, readable text on bottle, front lighting on bottle, purple oversaturation, tourist landmark, postcard sky`

**Check:** Look for any hint of label edge or lettering catching light. If it is there, discard.

---

#### H4. Hero, the pour, hands only

**Technique:** Text-to-image.
**Label rule:** Safe by cropping. The prompt keeps the bottle out of frame entirely.
**Aspect:** 16:9, also generate 4:5

```
Close view of a heavy cut crystal rocks glass on a dark walnut bar top, warm amber brandy already in the glass at a third, a single large clear ice cube, one hand of a person in their forties resting beside the glass, sleeve of a dark shirt turned back at the cuff, no bottle in frame, no label anywhere, single warm practical light source from the upper left throwing a long soft shadow to the right, champagne gold #CDB88D highlights in the liquid, near-black #141414 surroundings, cream #F5F1E6 in the brightest reflection only, 85mm lens at f/2, focus on the near rim of the glass, low-key photographic lighting, deep shadows that keep detail, quiet and restrained mood, premium spirits photography, fine natural film grain
```

**Negative:** BASE NEG plus `bottle in frame, second glass, cocktail garnish, straw, young hands, rings and jewellery, bar clutter, crowd`

**Check:** Count the fingers. Then check the ice sits in the liquid rather than hovering above it.

---

### 3.2 Gallery: The Bottle

---

#### B1. Catalogue bottle on cream

**Technique:** Background replacement on your real studio shot. Cut the bottle out, drop it on a cream field, add a contact shadow.
**Label rule:** Safe. Your pixels throughout.
**Aspect:** 4:5

Use this prompt only if you are generating the surface rather than filling flat cream:

```
A seamless studio backdrop in warm cream #F5F1E6, gently graded so the upper area is a half stop brighter than the lower, a soft directional light from the upper left, an empty product surface with a subtle warm shadow falling to the lower right, no objects, no text, fine paper texture, photographic studio backdrop, vertical composition
```

**Negative:** BASE NEG plus `objects, props, gradient banding, vignette, pure white, grey cast`

**Check:** The cut edge of the bottle at 200 percent. Glass edges are where cheap cutouts show a halo.

---

#### B2. The bottle, warm bar back shelf

**Technique:** Image-to-image on your studio bottle shot. Strength 0.30.
**Label rule:** Safe. Reference driven.
**Aspect:** 4:5

```
Keep the bottle exactly as in the reference image, unchanged in shape, label, crest and typography. Change only the surroundings. Place it on the back shelf of a quiet bar at night, dark stained timber shelf, an antique brass lamp out of frame casting warm champagne gold #CDB88D light from the left, the rest of the shelf falling into near-black #141414, one out of focus glass shape far behind on the right, deep shadow around the bottle, 85mm lens at f/2.2, focus locked on the label, everything behind it soft, low-key photographic lighting, quiet and restrained mood, premium spirits photography, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `other branded bottles, readable bottles behind, bar signage, price list, redrawn label, mirror reflection of a different label`

**Check:** Any other bottle in the background must be shapeless and unbranded. Generators will happily invent a competitor.

---

#### B3. The can, ice and condensation

**Technique:** Image-to-image on your studio can shot. Strength 0.25. The can is harder than the bottle because its whole surface is print.
**Label rule:** Safe only from your reference. Keep strength very low and check the ABV and volume text.
**Aspect:** 1:1 and 4:5

```
Keep the can exactly as in the reference image, unchanged: same artwork, same lettering, same colours, same proportions. Change only the setting. Stand the can in a shallow bed of rough cracked ice in a dark metal tray, fresh condensation beading on the metal, one cold hard light from the upper right catching the rim of the can and the wet ice, near-black #141414 background falling off fast, champagne gold #CDB88D in the highlights, a few drops of water on the tray, 100mm macro lens at f/5.6, focus on the front face of the can, low-key photographic lighting, quiet and restrained mood, premium beverage photography, fine natural film grain
```

**Negative:** BASE NEG plus `redrawn can artwork, altered lettering, wrong colours, second can, cola splash, straw, lime wedge, party setting`

**Check:** The "440ml" and "5%" text. If either is soft or wrong, drop the strength and rerun.

---

### 3.3 Gallery: In the Making

> Read the honesty note at the end of Section 2, and settle the open question in Section 6, before you publish anything from this group. If Verboten does not distil and age in-house, skip this entire category.

---

#### M1. Copper still, detail not tour

**Technique:** Text-to-image.
**Label rule:** Safe by absence.
**Aspect:** 4:5

```
Tight detail of a copper pot still, the curve of the swan neck and one riveted seam, aged copper with a warm patina running from champagne gold #CDB88D into deep bronze, faint steam drifting across the frame, one warm window light from the left, everything else in near-black #141414, no people, no signage, no gauges with numbers, 85mm lens at f/2.8, shallow depth of field, low-key photographic lighting, deep shadows that keep detail, quiet and restrained mood, industrial and precise, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `gauges with readable numbers, stencilled writing, factory signage, tour group, stainless steel modern plant, wide establishing shot`

**Check:** No readable numbers on any dial. And decide honestly whether this represents your process.

---

#### M2. Cask head in the dark

**Technique:** Text-to-image.
**Label rule:** Safe by absence.
**Aspect:** 1:1

```
The end of a French oak cask resting on its side in a dark cellar, the head of the cask facing camera, tight oak staves and a dark iron hoop, no writing and no chalk marks of any kind on the wood, one narrow shaft of warm light falling across the lower left of the cask, dust in the air, cool damp stone floor barely visible, colour palette limited to near-black #141414, champagne gold #CDB88D and cream #F5F1E6, 50mm lens at f/2.8, low-key photographic lighting, quiet and restrained mood, fine natural film grain, square composition
```

**Negative:** BASE NEG plus `chalk numbers, stencilled dates, batch markings, distillery branding, rows of barrels stretching away, wine cave cliche`

**Check:** Zero writing on the cask. This is where the no batch numbering rule gets broken by accident.

---

#### M3. Nosing the spirit

**Technique:** Text-to-image.
**Label rule:** Safe by absence. No bottle, plain tasting glass.
**Aspect:** 4:5

```
The hands of a person in their forties holding a plain unbranded tulip nosing glass containing a small measure of clear new spirit, held over a dark steel work bench, sleeves of a dark work shirt rolled to the forearm, weathered practical hands, no face in frame, no bottle in frame, no label anywhere, one warm overhead work light from directly above throwing the hands into relief, near-black #141414 background, champagne gold #CDB88D catching the rim of the glass, 85mm lens at f/2.5, low-key photographic lighting, deep shadows that keep detail, quiet, precise, unsentimental, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `face, smiling model, lab coat, clipboard, notebook with writing, laboratory beakers, wine tasting cliche, young hands, wedding ring closeup`

**Check:** Hands. Always hands. Count fingers, check the thumb sits correctly, check the glass has one continuous rim.

---

#### M4. The corridor

**Technique:** Text-to-image.
**Label rule:** Safe by absence.
**Aspect:** 16:9

```
A narrow working corridor inside a small spirits production space at night, painted concrete floor, one warm sodium light at the far end, dark shapes of tanks and pipework on both sides falling into near-black #141414, no people, no signage, no lettering on anything, the light pooling in champagne gold #CDB88D on the wet floor, deep shadow in the foreground, 35mm lens at f/2.8, low-key photographic lighting, quiet and restrained mood, a little dark, documentary photograph rather than a set, fine natural film grain, wide horizontal composition
```

**Negative:** BASE NEG plus `safety signage, exit signs, readable warning labels, fluorescent green cast, glossy corporate factory, people`

**Check:** Signage. Real industrial spaces are covered in it and the tool will invent gibberish versions.

---

### 3.4 Gallery: Out in the World

> Most of this category should be your real event photographs, cleaned up. See Section 4, Recipe 2. None of those photographs are currently in the project, so step one is finding them. The prompts here fill the gaps your camera roll does not cover.

---

#### W1. Bar back shelf, seen from across the room

**Technique:** Text-to-image. Safe because the bottle is far and soft.
**Label rule:** Safe by distance and defocus. No label detail may resolve.
**Aspect:** 16:9

```
Looking across a dark quiet bar toward the back shelf, shot from a seated eye level at the far end of the counter, the foreground an out of focus dark timber counter edge, warm lamps along the shelf glowing champagne gold #CDB88D, bottles on the shelf entirely out of focus and unreadable with no legible labels, near-black #141414 filling most of the frame, one soft cream #F5F1E6 highlight where light hits the counter, 50mm lens at f/1.8 with the focus on the empty counter in the near third so the whole shelf is soft, low-key photographic lighting, quiet and restrained mood, late evening, almost empty room, fine natural film grain, wide horizontal composition
```

**Negative:** BASE NEG plus `readable bottle labels, recognisable brands, busy crowd, television screen, menu board, bright overhead lighting`

**Check:** Every bottle on that shelf must be unreadable. If one resolves into a real brand, discard.

---

#### W2. Event night, no product

**Technique:** Text-to-image. A mood plate to sit between your real event photos.
**Label rule:** Safe by absence.
**Aspect:** 4:5

```
An outdoor evening event in Gauteng after sunset, warm string lights strung overhead between poles, a scatter of adults in their thirties and forties in dark clothing seen from behind and in soft focus, no faces identifiable, no drinks visible, a dark bar counter at the edge of frame, the sky still holding the last champagne gold #CDB88D band above near-black #141414 silhouettes, warm practical lighting only, 35mm lens at f/2, grain from a high ISO, documentary photograph rather than a staged shoot, quiet and restrained mood, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `identifiable faces, posed group photo, raised glasses toast, party chaos, confetti, stage lighting, sponsor banners, event signage`

**Check:** No sponsor banners with invented text, and no faces sharp enough to look like a real person.

---

#### W3. Rain, elsewhere

**Technique:** Text-to-image. This is the Johannesburg to Berlin, Amsterdam to Cape Town line as an image.
**Label rule:** Safe by absence.
**Aspect:** 1:1 and 9:16

```
A rain slicked cobbled street at night in a northern European city, one warm lit bar window on the right throwing champagne gold #CDB88D across the wet stones, everything else in near-black #141414 and cold blue shadow, no people, no readable signage, no lettering on the window, reflections of the window light stretching toward the camera in the wet road, 35mm lens at f/2, shot from low, low-key photographic lighting, quiet and restrained mood, a little dark, cinematic documentary photograph, fine natural film grain
```

**Negative:** BASE NEG plus `readable shop signs, street name plates, neon signage, tourists, umbrellas, car headlights, traffic, number plates`

**Check:** No vehicles and no lettering. Both undercut the mood and one of them breaks the alcohol rules.

---

### 3.5 Gallery: Where We Pour

> These double as background plates for compositing your real bottle into. Generate them at the largest size your tool allows.

---

#### P1. The empty counter, golden hour

**Technique:** Text-to-image. Built deliberately with an empty spot for your real bottle.
**Label rule:** Safe by absence, and it becomes safe with product once you composite your real photo in.
**Aspect:** 16:9

```
An empty dark walnut bar counter photographed at golden hour, low warm sun entering from the right through a window out of frame, dust in the light, aged brass fittings catching champagne gold #CDB88D, the back of the room falling into near-black #141414, a clear empty area of counter in the left third with clean level surface and no props, one soft cream #F5F1E6 highlight along the counter edge, 85mm lens at f/2.8 focused on the empty counter area, shallow depth of field, low-key photographic lighting, quiet and restrained mood, premium interior photography, fine natural film grain, wide horizontal composition
```

**Negative:** BASE NEG plus `bottles, glasses, props, people, bar stools blocking the counter, clutter, overhead spotlights`

**Check:** Is the empty area actually clean and level, and is the light coming from the same side as in your studio bottle shot. If not, this plate will not composite believably.

---

#### P2. Restaurant table, evening

**Technique:** Text-to-image.
**Label rule:** Safe by absence.
**Aspect:** 4:5

```
A set restaurant table at night photographed from a low angle across the cloth, cream #F5F1E6 linen, one lit candle out of focus in the background, two empty cut crystal rocks glasses turned upright, dark timber chair backs beyond, warm candlelight and one small warm downlight, near-black #141414 room behind, champagne gold #CDB88D in the glass edges and the cutlery, no food, no bottle, no menu, no lettering, 50mm lens at f/2, shallow depth of field, low-key photographic lighting, quiet and restrained mood, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `menu with text, wine glasses full, food plates, people, flower arrangement, tablecloth logo, place cards`

**Check:** Both glasses should be the same shape. Generators drift on repeated objects.

---

#### P3. Stoep at sunset

**Technique:** Text-to-image. The South African one.
**Label rule:** Safe by absence.
**Aspect:** 16:9

```
The wooden arm of an old chair on a covered stoep at sunset in Pretoria, one cut crystal glass of amber brandy with a single large ice cube resting on the flat wooden arm, no bottle in frame, no label anywhere, no people, beyond the stoep a dark garden and a Highveld sky graded from champagne gold #CDB88D at the horizon into deep near-black #141414 above, warm low sun raking across the timber grain from the left, long shadows, 50mm lens at f/2.2, focus on the glass, low-key photographic lighting, quiet and restrained mood, late summer evening, fine natural film grain, wide horizontal composition
```

**Negative:** BASE NEG plus `bottle in frame, people, pets, braai fire, swimming pool, patio furniture set, garden clutter, purple jacaranda oversaturation`

**Check:** Ice physics. The cube must displace liquid, not float on top like a plastic prop.

---

#### P4. The listening room

**Technique:** Text-to-image. For the quieter, more private side of the brand.
**Label rule:** Safe by absence.
**Aspect:** 4:5

```
A dark room with one leather armchair and a low side table, a single glass of amber brandy on the table beside a closed book, one warm floor lamp to the left throwing a narrow pool of champagne gold #CDB88D light, the rest of the room in near-black #141414, heavy curtain edge just visible, no people, no bottle, no lettering, no television, 35mm lens at f/2, shot from standing height looking down slightly, low-key photographic lighting, deep shadows that keep detail, quiet, private, a little dark, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `television, laptop, phone, bookshelf with readable spines, cigar, ashtray, hunting trophy, leather club cliche`

**Check:** No cigar or ashtray. Generators add them constantly and it pushes the brand somewhere you have not decided to go.

---

### 3.6 The three serves

> These earn the most use per image. People save serve images, screenshot them, and copy them at home. Make these good.
> Each serve gets a build shot and a hero shot. The glass carries no label, so full generation is safe as long as the bottle stays out of frame or comes from your real photo.

---

#### S1. Neat, one cube

**Technique:** Text-to-image for the glass alone. Optional second version: composite your real bottle behind it using Recipe 3.
**Label rule:** Safe by absence, as written. If you add the bottle, it must be your photograph.
**Aspect:** 4:5

```
A single heavy cut crystal rocks glass on a dark slate surface, 50ml of warm amber brandy inside, one large perfectly clear ice cube just beginning to sweat, a thin band of champagne gold #CDB88D light refracting through the base of the glass onto the slate, near-black #141414 background falling off entirely, one hard warm light from the upper right and a soft fill from the left, cream #F5F1E6 only in the sharpest highlight on the rim, no bottle in frame, no label, no garnish, 100mm macro lens at f/4, focus on the front rim and the ice, low-key photographic lighting, deep shadows that keep detail, quiet and restrained mood, premium spirits photography, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `bottle, garnish, orange peel, straw, second glass, crushed ice, cloudy ice, condensation flood, water spill, coaster with text`

**Check:** The liquid line must sit level across the glass. Tilted liquid is the giveaway.

---

#### S2. Brandy and Cola, tall

**Technique:** Text-to-image for the glass. Add your real can from your studio shot as a composite if you want the product in frame.
**Label rule:** Safe by absence. **Never let the tool generate a cola can or a cola logo.** If one appears, discard the image.
**Aspect:** 4:5 and 9:16

```
A tall highball glass filled with ice and dark cola mixed with brandy, standing on a dark timber counter, condensation running down the outside of the glass, a wide strip of orange peel resting against the ice, the cola reading deep near-black #141414 with warm champagne gold #CDB88D light passing through the upper third of the liquid, backlit from the right so the ice glows, dark background, no cans and no bottles in frame, no labels, no branding on anything, 85mm lens at f/2.8, focus on the ice at the front of the glass, low-key photographic lighting, quiet and restrained mood, premium beverage photography, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `cola can, soft drink branding, red and white can, cans in background, straw, paper umbrella, lime wedge, party setting, crushed ice slush, overflowing glass`

**Check:** Scan the background for any invented can. Then check the peel looks cut, not painted on.

---

#### S3. Silverton Old Fashioned

**Technique:** Text-to-image for the hero. Build the flat lay as F1 below.
**Label rule:** Safe by absence.
**Aspect:** 1:1 and 4:5

*Proposed serve and proposed name. Neither is confirmed brand fact yet. Mix it, taste it, and sign it off before you publish it as your house serve: 50ml Verboten Premium Brandy, 10ml sugar syrup, two dashes aromatic bitters, one large cube, wide orange peel expressed over the top. Listed in Section 6.*

```
A short heavy tumbler holding a brandy old fashioned, one large clear ice cube, a wide strip of orange peel twisted over the rim with the oils visible as a faint mist above the drink, deep amber liquid, set on a dark textured stone surface, one warm hard light from behind and left creating a bright edge on the ice and leaving the front of the glass in shadow, near-black #141414 surroundings, champagne gold #CDB88D through the liquid, a scatter of orange oil droplets on the stone, no bottle in frame, no label, no bar tools in frame, 100mm macro lens at f/4, shallow depth of field, low-key photographic lighting, quiet and restrained mood, premium cocktail photography, fine natural film grain
```

**Negative:** BASE NEG plus `cherry, cocktail sword, sugar rim, mint, straw, jigger, mixing glass, bar spoon, flaming peel, smoke gun, cluttered bar top`

**Check:** One cube, not three. And no flaming garnish. Flame reads as showing off, which is the wrong register.

---

#### F1. Flat lay, the build

**Technique:** Text-to-image. Works for all three serves, swap the ingredient list.
**Label rule:** Safe by absence. Composite your real bottle in afterwards if you want it, using Recipe 3.
**Aspect:** 1:1

```
Overhead flat lay on a dark slate surface, arranged with generous space between each item: one empty heavy tumbler, one large clear ice cube in a small steel bowl, a whole orange with one wide strip of peel cut from it lying beside it, a small unlabelled glass bottle of bitters with no lettering, a small dish of sugar, nothing else, one soft warm light from the upper left with long soft shadows falling to the lower right, near-black #141414 surface, champagne gold #CDB88D highlights, cream #F5F1E6 in the sugar only, shot from directly above with a 50mm lens at f/5.6, everything sharp, low-key photographic lighting, quiet and restrained mood, premium spirits photography, fine natural film grain, square composition
```

**Negative:** BASE NEG plus `labels on any bottle, readable text, cluttered arrangement, recipe card, hands, tongs, crowded frame, bright even lighting`

**Check:** The bitters bottle must be blank. Any lettering on it kills the shot.

---

#### S4. The single cube, extreme close

**Technique:** Text-to-image.
**Label rule:** Safe by absence.
**Aspect:** 1:1

```
Extreme close view of a single large clear ice cube submerged in warm amber brandy inside a glass, filling most of the frame, tiny air trails rising from the edge of the cube, the amber liquid reading champagne gold #CDB88D where the light passes through and near-black #141414 at the edges, backlit from directly behind with a small hard source, 100mm macro lens at f/5.6, focus on the near face of the cube, low-key photographic lighting, quiet and restrained mood, abstract and still, fine natural film grain, square composition
```

**Negative:** BASE NEG plus `bubbles like soda, fizzing, crushed ice, cloudy ice, glass rim in frame, hand, straw`

**Check:** The bubbles must read as slow air trails, not carbonation. Carbonation makes it look like a cooldrink.

---

### 3.7 Instagram grid

> Ratios that currently work: feed posts 4:5, carousels 4:5 kept consistent across all slides, stories and reels covers 9:16. Platforms adjust supported ratios from time to time, so check the current spec before you build a batch.
> Set the age restriction on the Instagram and Facebook profiles, and on individual posts where the platform offers it. Meta and TikTok restrict paid alcohol promotion and require age targeting, and the rules differ by country and change without much notice. Organic posting behind an age gate is the safer route. Check each platform's current alcohol policy before you spend anything on ads.
> Do not bake text into generated images. Generate the background, add type in Canva with your real typeface so the letterforms are correct.

---

#### IG1. Quote plate, gold on black

**Technique:** Text-to-image. Background only, no words baked in.
**Label rule:** Safe by absence.
**Aspect:** 4:5

```
An abstract background of near-black #141414 textured plaster with a single soft diagonal sweep of champagne gold #CDB88D light falling across the lower right corner, heavy vignette, the upper left two thirds almost completely dark and clean with no detail, fine grain, subtle depth like a photograph of a wall rather than a graphic, no text, no shapes, no symbols, low-key photographic lighting, quiet and restrained mood, vertical composition
```

**Negative:** BASE NEG plus `text, letters, symbols, geometric shapes, gradient banding, pattern, marble, glitter, bokeh lights`

**Check:** The dark area must be genuinely clean. You are setting type on it in your own typeface, and texture behind letters makes them hard to read. When you set the line, copy the spelling exactly: **VIR DIÉ WAT WEET**, with the accent on the E, or **MEMORIES NOT REGRETS**. Check the accent survived the export.

---

#### IG2. Story background, vertical

**Technique:** Text-to-image.
**Label rule:** Safe by absence.
**Aspect:** 9:16

```
A vertical background of dark aged leather in near-black #141414, one narrow shaft of warm champagne gold #CDB88D light entering from the top right and fading out by the middle of the frame, the lower half almost entirely dark, subtle grain in the leather, no text, no objects, low-key photographic lighting, quiet and restrained mood, photographic rather than graphic, tall vertical composition with clear empty space in the centre for text
```

**Negative:** BASE NEG plus `text, logo, stitching pattern, luggage, furniture, buttons, bright highlights in the centre`

**Check:** Open it on your phone and hold a thumb where the caption sticker goes. Still readable.

---

#### IG3. Carousel tonal set

**Technique:** Text-to-image. Run the same prompt three times with the surface changed to slate, oak, and brass so the three slides sit together.
**Label rule:** Safe by absence.
**Aspect:** 4:5, identical across all slides

```
A close abstract photograph of a dark SURFACE lit by one warm raking light from the left, the texture reading clearly in the lit third and falling into near-black #141414 across the rest of the frame, champagne gold #CDB88D only in the highlight, no objects, no text, 100mm macro lens at f/5.6, low-key photographic lighting, quiet and restrained mood, fine natural film grain, vertical composition
```

*Replace SURFACE with `slate`, then `oak end grain`, then `aged brass`.*

**Negative:** BASE NEG plus `objects, text, pattern repeat, tile, seamless texture look, bright even lighting`

**Check:** Put the three side by side. If one is noticeably brighter, regenerate that one rather than fixing it in editing.

---

#### IG4. Grid anchor, your bottle in a scene

**Technique:** Image-to-image on your studio shot, strength 0.30.
**Label rule:** Safe from your reference.
**Aspect:** 4:5

```
Keep the bottle exactly as in the reference image, unchanged in shape, label, crest and typography. Change only the surroundings. Place it standing on a rough dark stone ledge outdoors at blue hour, the last champagne gold #CDB88D light on the horizon behind and far below a dark Highveld landscape, the sky deepening into near-black #141414 overhead, the bottle lit by one small warm light from the front left so the label reads clearly, cool ambient shadow on the right side of the glass, 85mm lens at f/2.8, bottle in the lower third, sky filling the upper two thirds, low-key photographic lighting, quiet and restrained mood, fine natural film grain, vertical composition
```

**Negative:** BASE NEG plus `redrawn label, second bottle, people, tourist viewpoint, safari cliche, wildlife, sun flare`

**Check:** Label at 200 percent. Then check the bottle's light direction matches the scene, or it will look pasted.

---

#### IG5. Reel cover, the pour

**Technique:** Text-to-image.
**Label rule:** Safe by cropping. Bottle deliberately out of frame.
**Aspect:** 9:16

```
A stream of amber brandy pouring into a heavy tumbler seen from the side, the bottle out of frame above so only the falling liquid is visible, the stream catching a hard warm light from behind and reading champagne gold #CDB88D against a near-black #141414 background, a slight splash forming in the glass, frozen at a high shutter speed, 100mm macro lens at f/5.6, low-key photographic lighting, quiet and restrained mood, premium spirits photography, fine natural film grain, tall vertical composition with empty dark space at the top for text
```

**Negative:** BASE NEG plus `bottle in frame, label, hands, overflowing glass, chaotic splash, water look, foam, bubbles`

**Check:** The stream must be continuous. Broken or doubled streams are a common generation failure.

---

### 3.8 Marketplace white background

> This is the commercial one. Retail portals and marketplaces generally want a plain white background, the product centred, and nothing added on the main image. The exact requirements differ by platform and they get revised, so pull the current image spec for every platform you list on before you export a batch. Do not generate these images. Convert your real photographs. Full method in Section 4, Recipe 5.

---

#### MP1. Single bottle on white

**Technique:** Background replacement on your real studio shot. Cut out, place on white, add a contact shadow.
**Label rule:** Safe. Your pixels only. Never regenerate the label to "sharpen" it.
**Aspect:** 1:1

If your tool needs a prompt for the replacement fill, use exactly this and nothing more:

```
Pure flat white background, no gradient, no texture, no shadow, no objects, no reflection, plain studio white
```

**Negative:** BASE NEG plus `gradient, grey, vignette, reflection, surface, props, shadow`

**Check:** Sample the background with a colour picker in three corners. All three must read 255, 255, 255.

---

#### MP2. Two bottle set on white

**Technique:** Background replacement on your real set photograph.
**Label rule:** Safe. Your pixels.
**Aspect:** 1:1

Same fill prompt as MP1.

**Check:** Both bottles must sit on the same invisible ground line and cast shadows in the same direction. Cutouts of pairs often drift.

---

#### MP3. Can on white

**Technique:** Background replacement on your real can shot.
**Label rule:** Safe. Your pixels.
**Aspect:** 1:1

Same fill prompt as MP1.

**Check:** The curved edges of the can. Cylinders pick up halos more than bottles do.

---

#### MP4. Secondary listing image, scale and serve

**Technique:** Composite. Your real bottle from MP1, placed on a light cream surface, next to a generated glass from S1.
**Label rule:** Safe. Product pixels are yours, everything else is generated.
**Aspect:** 1:1

Background plate prompt:

```
An empty warm cream #F5F1E6 studio surface photographed straight on, a soft gradient falling off to a slightly deeper cream at the edges, one directional light from the upper left casting soft shadows to the lower right, no objects, no props, no text, clean product photography backdrop, square composition
```

**Negative:** BASE NEG plus `objects, props, pattern, marble, wood grain, harsh shadow, pure white`

**Check:** Rules on text and props in secondary images differ by platform. Check the current spec for the platform you are listing on before you add the 750ml and 43% callouts. Whatever the spec allows, only put on the image what is true: 750ml, 43% ABV, 3 years in oak, finished in French oak casks.

---

## 4. Making your existing photos go further

Five recipes. These are worth more than the generated shots because they start from something real.

---

### Recipe 1. Studio-on-black bottle to a warm bar scene

Your studio shots are lit clean on black. That is a good starting point because the bottle is already separated from its background.

1. Open your bottle file in an image-to-image tool. Use the largest version you have. Once the photographer sends the originals, use those instead.
2. Paste prompt **B2** or **H1**.
3. Set strength to **0.25**. Generate four.
4. If the background barely changed, step up to 0.30, then 0.35. Stop the moment the label starts to soften.
5. Pick the version where the light on the bottle matches the light in the new background. If the bottle is lit from the left and the scene is lit from the right, it will look wrong even if you cannot say why.
6. Zoom to 200 percent on the label. Read every word out loud. Check VERBOTEN, check the 43%, check the 750ml, check the crest shape.
7. If the label failed, use Recipe 3 instead. Compositing beats fighting the strength slider.

**Time:** about 20 minutes per finished image, including the ones you throw away.

---

### Recipe 2. Cleaning up a real event photograph

Your event photographs are your only genuinely real proof that people drink this in public. They are worth more than any generated scene. They are also not in the project folder yet, so step zero is finding them and copying them in. Expect them to be underexposed, noisy, and full of background clutter.

1. **Copy the original somewhere safe first.** Work on the copy. Never overwrite.
2. **Denoise.** Most upscalers and phone editors do this. Go gently. Over-denoised skin looks like wax and destroys the documentary feel that makes the photo valuable.
3. **Grade to the palette.** Pull the shadows toward near-black, warm the highlights toward champagne gold, drop overall saturation slightly. You are looking for the photo to feel like it belongs beside the generated plates. Do not push it into an orange filter.
4. **Inpaint the clutter.** Mask over the bin, the extension cord, the competitor's banner, the plastic chairs. Prompt the masked area with a description of what should be there: `dark timber wall in shadow, no text, no objects`. Small masks work, big masks invent nonsense. Do several small ones rather than one large one.
5. **Outpaint if the crop is too tight.** If you need a 16:9 hero from a vertical phone photo, extend the sides rather than cropping the heart out of the image. Extend in one direction at a time and only extend into simple areas like a dark wall or a sky.
6. **Faces.** Do not alter, beautify, or replace a real person's face. Do not use a photograph of an identifiable person to advertise alcohol without their written permission. If in doubt, crop them out or use the back-of-head shots.
7. **Ban list on event photos:** nobody who could read as under 25, no one holding car keys, no visible over-serving, no drink in a moving vehicle, no drink near a driver.

**Time:** 15 to 40 minutes per photo. Do three good ones, not twelve rushed ones.

---

### Recipe 3. Generate a background, composite the real bottle in

This is the most reliable route to a product shot in a scene, and it is what I would use for anything that matters. The label is untouched because the label is never regenerated.

1. **Cut out the bottle.** Remove the black background from your studio shot with a background remover, or use Photoshop's subject selection. Save as PNG with transparency. Zoom to 200 percent along the glass edge and clean up any black fringe. Glass edges are fiddly, take the extra five minutes.
2. **Generate the plate.** Use **P1**, **P2**, **P3**, or **P4**. Note which side the light comes from in the plate.
3. **Match light direction.** If the plate is lit from the right and the bottle from the left, flip the bottle horizontally only if the label allows it, which it usually does not. Rather generate a new plate lit from the correct side. Add the light direction to the prompt: `one warm light from the upper left`.
4. **Place and scale.** Measure your actual bottle with a tape, base to cap, and write the number down once. Then scale the cutout against something of known size in the plate so it does not read as a giant or a toy.
5. **Contact shadow.** This is the step people skip and it is what makes composites look fake. Paint a soft dark ellipse under the base, darkest and tightest right at the contact point, fading outward in the direction opposite the light. Then a longer, softer cast shadow going away from the light. Set both to multiply at low opacity.
6. **Match grain and colour.** Add a small amount of noise to the bottle layer so it matches the plate's grain. Nudge the bottle's colour temperature toward the plate.
7. **Optional, sell it.** A single soft warm highlight painted down the edge of the glass facing the light source ties it together.

**Time:** 30 to 45 minutes the first time, 15 once you have the cutout saved.

---

### Recipe 4. Upscaling, and when not to

Your current files at 1024px and 1066px are too small for print, for a full width hero on a large screen, and for most marketplace specs.

1. **Try the photographer first.** A real 6000px original beats any upscale. This is a free email.
2. **If upscaling, do it before compositing,** not after. Upscale the bottle cutout, upscale the plate, then combine. Upscaling a finished composite smears the shadow edges.
3. **Use a conservative setting.** Many upscalers offer a "creative" or "enhance detail" mode that redraws detail. **Never use a creative upscale on the label.** It will invent letterforms. Use the plain, faithful mode.
4. **If the upscaler mangled the label anyway,** upscale twice: once faithful for the label region, once creative for the glass and background, then mask the original label region back over the top.
5. **2x is usually safe. 4x on a 1024px file is wishful thinking** and it will show as plastic texture on the glass.
6. **Never upscale the crest.** `crest.png` is 224 x 221. Any enlargement of it invents edges on the one mark that has to be exact. Get the vector.

---

### Recipe 5. Marketplace white background conversion

The commercially important one. Portals reject listings over a background that is not what the spec asks for, and a rejected listing sells nothing.

1. Start from the **highest resolution real photograph** you have of the product. Chase the originals.
2. **Remove the black background.** Photoroom, Canva, remove.bg, or Photoshop's select subject. Export PNG with transparency.
3. **Inspect the edge at 200 percent.** Dark glass on a black background often leaves a black halo where the remover could not tell glass from background. Clean it by hand. This is the most common reason a white background shot looks cheap.
4. **New square canvas, pure white.** Fill with `#FFFFFF` exactly. Not off white, not cream. Cream is your brand colour but it is not what an automated background check on a main image is looking for.
5. **Place and size the product.** Centred, filling the frame without crowding it, with even margin top and bottom. Some portals specify a minimum percentage of the frame the product must fill, so check the current spec. Keep the framing identical across all three products so your listings look like one family.
6. **Contact shadow, if allowed.** Some portals want no shadow at all, some allow a soft natural one. Check the rules for your platform. If in doubt, produce both versions.
7. **Export.** Square, at least 1500 x 1500 and larger if your source allows. sRGB colour profile, JPEG at high quality. Confirm the minimum dimensions, accepted file formats, and file size cap in the current spec for each platform before you send a batch.
8. **Final check.** Colour pick three corners for 255, 255, 255. Zoom to 200 percent on the label and confirm every character is your real label, unaltered.
9. Name the files plainly: `verboten-premium-brandy-750ml-white-1.jpg`. And decide whether `batch-no-01` stays in your naming at all, given the no batch numbering rule.

**Do not generate a marketplace image from scratch. Ever.** A generated label on a retail listing is a genuine problem, not a shortcut.

---

### The quality check, before anything goes live

Run this on every image. It takes 60 seconds and it catches almost everything.

- **Label.** Zoom to 200 percent. Read every character. Compare against the real bottle in your hand.
- **Hands.** Count fingers. Check the thumb. Check the wrist connects.
- **Liquid.** Level across the glass. Ice displaces rather than floats. No carbonation in the neat serve.
- **Reflections.** What is reflected should exist in the scene.
- **Duplicates.** Scan the background for a second bottle, a doubled glass, a repeated hand.
- **Invented text.** Any signage, book spine, dial, bottle, or banner that has letters on it. If it has letters and they are not yours, remove it.
- **Compliance.** Ages, vehicles, quantity in frame, and no under-18 signals anywhere.
- **Palette.** Does it sit next to your other images without shouting.

---

## 5. What still needs a real camera

Honest list. None of this is fixable with prompts, and pretending otherwise costs more later.

**1. Full resolution product originals.** Not a shoot, an email. Your web files are 1024px and 1066px and heavily compressed. Everything in this pack works better with the camera files. Start here. Ask for the vector crest in the same message.

**2. The two founders.** A brand built on two people who broke convention needs those two people to exist visibly at some point. Generated portraits of fake founders are the one lie that ends a drinks brand. Even a good phone portrait against a dark wall, shot in window light, beats anything generated. Whether you want to be visible at all is a real decision given the quiet positioning, but if you do, it has to be you.

**3. The Silverton premises, if you claim it.** If you distil or age in-house, one afternoon photographing your own space produces images no generator can match, because they are true. If you do not, do not publish production imagery at all.

**4. Any close shot of a hand holding the bottle.** The moment a real hand grips a real bottle at close range, you need real fingers wrapped around a real label with real light bending through real glass. AI does not do this convincingly, and this is the most useful image type for social. One hour with a phone, a window, and a friend in their thirties solves it.

**5. Real pour footage with the label visible.** Motion plus a readable label is beyond current tools. If you want a pour video with the bottle in it, you shoot it.

**6. Gift packaging, tubes, and any secondary packaging.** Structure and print that AI has never seen. Photograph it.

**7. Your actual stockists.** "Quality bars that know their stuff" is a claim. One real photograph of your bottle on a real named bar's shelf, with their permission, is worth twenty generated bar scenes. Ask each stockist. Most will say yes and most will repost it.

**8. The gin, when it lands.** New bottle, new label, no reference photograph. Nothing in this pack helps until it has been shot once. No date is set, so nothing here should imply one.

**The pattern:** AI covers mood, texture, environment, glassware, and abstraction. Your camera covers anything true about the product, the people, or the place. Use each where it is honest.

---

## 6. Open questions to settle

Five decisions. Each one changes what you should generate, so answer them before the evenings start adding up.

1. **The palette.** The hex values used throughout this pack come from your site build, not from a signed-off identity document. If a real spec exists, check the three values against it now.
2. **Batch numbering.** The file and product names carry `batch-no-01` while the brand rule says no batch numbering and products are permanent. Either the rule changes or the naming does. Pick one.
3. **Production imagery.** Do you distil and age in Silverton, in-house? If yes, Section 3.3 is fair as clearly labelled illustration and your own premises are a better shoot. If any part is contracted, publish nothing from that section.
4. **The house serve.** The Silverton Old Fashioned in S3 is a proposal, name included. Mix it, taste it, and confirm before it goes anywhere public.
5. **The event photographs.** Do they exist, and where? Section 3.4 and Recipe 2 are both built on them. If they cannot be found, that part of the plan is a shoot, not an edit.

---

## Appendix. Fast reference

| Where it goes | Ratio | Technique | Prompts |
|---|---|---|---|
| Website hero desktop | 21:9 or 16:9 | Image-to-image and text-to-image | H1, H2, H3, H4 |
| Website hero mobile | 4:5 | Regenerate, do not crop | H1, H4 |
| Gallery, The Bottle | 4:5 | Your photo as base | B1, B2, B3 |
| Gallery, In the Making | 4:5 and 1:1 | Text-to-image | M1, M2, M3, M4 |
| Gallery, Out in the World | 16:9 and 4:5 | Real event photos plus text-to-image | W1, W2, W3, Recipe 2 |
| Gallery, Where We Pour | 16:9 and 4:5 | Text-to-image, also background plates | P1, P2, P3, P4 |
| Serves | 4:5 and 1:1 | Text-to-image | S1, S2, S3, S4, F1 |
| Instagram feed | 4:5 | Mixed | IG1, IG3, IG4 |
| Stories and reels | 9:16 | Text-to-image | IG2, IG5 |
| Marketplace main | 1:1 | Background replacement only | MP1, MP2, MP3 |
| Marketplace secondary | 1:1 | Composite | MP4 |

**Disclaimer line for any caption:** Drink responsibly. Not for sale to persons under 18.