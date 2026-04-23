
유저 요청
  ├─ 일반 생성 → Step 1 (3:2 주제부) → Step 2 (1:1 아웃페인팅)
  ├─ edit=true  → 단일 호출 (기존 이미지 수정)
  └─ enhance=true → 단일 호출 (첨부 이미지 보정)

모델: gemini-2.5-flash-image (폴백: gemini-3.1-flash-image-preview → gemini-3-pro-image-preview)


Generate an image for a card background about: "{userRequest}"
Overall aesthetic mandate: Hyundai Card app visual identity — clean, minimal, brand-appropriate. Light or brand-color backgrounds. Grounded compositions (objects sit on surfaces, not floating). Commercial-grade quality. NOT a typical AI-generated image: absolutely NO floating objects in gradient backgrounds, NO glowing orbs, NO claymorphism, NO oversaturated AI palette, NO Midjourney-style aesthetics.

[카드 텍스트가 있으면]: The card text reads: "{nm1 / nm2 / nm3}". Use this for mood/theme reference only — do NOT render any text in the image.

The subject and objects in the image MUST match the topic above. Choose appropriate items, settings, and props that relate to "{userRequest}".

Use the following rendering guidelines:
- Style: {<preset.st>yle}
- Camera: {preset.camera_angle}
- Lighting: {preset.lighting}
- Atmosphere: {preset.atmosphere}
- Color palette: {primary colors} with accents of {accent colors}

Composition:
- Background: a styled setting that fits "{userRequest}" and the mood above
- Center: the main subject directly related to "{userRequest}"
- The image should be FULL and RICH across the entire frame — no large empty/blank areas.
- This is a SUBJECT-FOCUSED crop. Fill the ENTIRE frame with the main subject and its immediate context.
- The main subject should be prominently centered, occupying 50-70% of the frame.
- No need to reserve space for text — every area should have rich visual content.

Hard constraints: {constraints}. Absolutely NO text, letters, words, numbers, or typography anywhere in the image. NO logos, brand marks, symbols, watermarks, or emblems. NO electronic devices, screens, laptops, tablets, or phones.
Format: Landscape 3:2, commercial-grade quality. This is the subject area of a card — will be extended upward later.

[브랜드 감지 시 추가]: Brand "{brand}" key colors: Primary: #XXXXXX. Use these as subtle accent colors only (e.g. a small prop, lighting tint, or background tone). Do NOT make the entire image this color. Keep the palette natural and balanced. Do NOT render any logos, brand marks, or symbols in the image.

[외부 브랜드 컨텍스트 추가]: This is for "{brandName}" — {description}. Target audience: {targetAudience}. Service characteristics: {serviceCharacteristics}. The image subject, mood, and setting should reflect this service's nature and appeal to its users.


You are extending a subject-focused image UPWARD to create a complete card background.

The attached image contains the main subject/focal area of a card. Extend this image to a 1:1 square format by adding content ABOVE.

RULES:
- The UPPER portion (newly added area, ~top 35%) must be LOW-CONTRAST and SIMPLE — this is where text will overlay
- Use natural continuation of the existing background: soft gradients, blurred colors, bokeh, atmospheric haze, or subtle texture
- The transition from existing image to extended area must be SEAMLESS — no visible seam or boundary
- Do NOT modify, crop, or recompose the existing lower portion of the image
- Do NOT add new objects, text, logos, or distinct elements in the extended area
- Maintain the same color palette, lighting direction, and mood
- Maximum sharpness and detail — the output will be displayed at 3x resolution
 style: Commercial photography, editorial grade, premium brand campaign quality.
       Natural, clean, grounded — like a real product/lifestyle photo shoot
       for a Korean finance app. Brand-appropriate colors, NOT forced dark or monochromatic.
camera: 45-degree or eye-level, natural perspective, clean composition
lighting: Natural or soft studio lighting, brand-appropriate color temperature.
          Clean directional light with gentle shadows.
          NOT dramatic, NOT moody, NOT dark editorial.
palette: [{BRAND_PRIMARY}, white, clean neutral] + [{BRAND_SECONDARY}, natural material tones]
atmosphere: Clean, fresh, professional, brand-appropriate. Premium but accessible.
            NOT dark, NOT cinematic noir.

style: Clean simple 3D render on a solid light background. Grounded objects that
       sit naturally on a surface — Hyundai Card app illustration style.
       NOT complex scene, NOT generic AI 3D: NO floating objects,
       NO gradient orb backgrounds, NO claymorphism, NO oversaturated palette,
       NO glowing effects.
camera: Slightly elevated 30-degree angle, clean product shot composition
lighting: Soft even studio lighting from above-left. Clean shadows that ground
          the object to the surface. NOT flat, NOT dramatic.
palette: [{BRAND_PRIMARY}, white, soft light background] + [{BRAND_SECONDARY}, subtle shadow]
atmosphere: Simple, clean, readable, trustworthy. Objects look real and grounded.
            Brand color used as background wash. NOT playful toy-like.
constraints+: Objects must sit on a surface — NO floating in mid-air.
              Solid or very subtle gradient background only.

style: Clean minimal graphic design on a solid brand-color background.
       Brand color fills the background; one or two clean graphic elements.
       NOT AI illustration: NO gradient blobs, NO bubbly shapes,
       NO pastel rainbow, NO whimsical characters, NO Midjourney style.
camera: Front-facing flat perspective, no depth
lighting: No lighting — flat color blocking with simple drop shadows only.
          NO gradient glows.
palette: [{BRAND_PRIMARY}, white, clean neutral] + [{BRAND_SECONDARY}, one geometric accent only]
atmosphere: Bold, clean, brand-forward. NOT decorative overload, NOT trendy illustration.
constraints+: Solid color or very simple two-color background only.
              NO complex illustrations, NO scene-building.

You are EDITING an existing card background image. The user wants specific changes applied to the attached image.

ATTACHED: The current card background image that must be preserved as the base.
USER REQUEST: "{prompt}"
[선택] ORIGINAL GENERATION CONTEXT: This image was originally generated for "{originalPrompt}". Maintain the same theme and subject while applying the user's edit request.

RULES:
- PRESERVE the overall composition, subject placement, and layout of the attached image
- ONLY modify what the user specifically requested (e.g. brightness, color tone, style adjustment)
- Maintain the same 1:1 square aspect ratio
- Keep the text-safe zone (top ~35%) with low contrast for text overlay
- Do NOT regenerate from scratch — this is an EDIT of the existing image
- The result should look like the same image with targeted modifications, not a completely new image
- Maximum sharpness and detail — output will be displayed at 3x resolution (1005×1044px)

You are enhancing a user-provided image for use as a 1:1 square card background.
The output will be exported at 3x resolution (1005×1044px WebP), so maximum sharpness and detail is critical.

TASK:
- Enhance the attached image to high quality and extend it to fit a 1:1 square aspect ratio
- Position the main subject (focal object) so its center sits at approximately the lower 1/3 of the image (around 66% from top). The upper 2/3 is where text overlays will go
- Extend/outpaint ONLY with simple, natural continuation of the existing background (sky, blur, gradient, etc.)
- Maximize sharpness: crisp edges, fine texture detail, no softness or blur on the subject. The image must hold up at 3x pixel density without looking mushy
- Clean, natural lighting and true-to-life colors

DO NOT:
- Do NOT add any new objects, elements, or details that are not already in the original image
- Do NOT add text, logos, watermarks, or UI elements
- Do NOT change or reinterpret the subject — if something is ambiguous, leave it as-is
- Do NOT fill empty space with concrete new objects — use only simple background continuation (solid color, sky, bokeh, blur)
- Do NOT change the original mood, color palette, or atmosphere
- Do NOT apply any artificial sharpening artifacts or HDR-like over-processing

User context: {prompt}
