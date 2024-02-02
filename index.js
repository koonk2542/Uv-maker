const fs = require("fs");
const { loadImage, createCanvas } = require("@napi-rs/canvas");
const path = require("path");
const klasorYolu = path.join(__dirname, "input");
const canvasGif = require("canvas-gif");
const config = require("./config.json");
let json = {
  namespace: "ui_animation",

  animation: {
    anim_type: "uv",
    easing: "linear",
    from: "$uv_frame",
    to: "$uv_frame",
    duration: config.duration ?? 0.5,
  },
};
let frames = [];

fs.stat(klasorYolu, (err, stats) => {
  if (err) {
    if (err.code === "ENOENT") {
      console.error("Hata: Klasör bulunamadı.");
    } else {
      console.error("Klasör durumu kontrol hatası:", err);
    }
    return;
  }

  fs.readdir(klasorYolu, async (readErr, dosyalar) => {
    if (readErr) {
      console.error("Klasör okuma hatası:", readErr);
      return;
    }
    console.log("Dosyalar Bulundu :");
    const dosyas = dosyalar.filter(
      (dosya) => dosya.endsWith(".png") || dosya.endsWith(".gif")
    );
    for (const dosya of dosyas) {
      console.log(dosya);

      if (dosya.endsWith(".gif")) {
        const p = path.join(klasorYolu, dosya);
        await canvasGif(
          p,
          async (ctx, width, height, totalFrames, currentFrame) => {
            let data = {};
            data.width = width;
            data.height = height;
            const d = await ctx.canvas.toDataURL("image/png");
            data.data = d;
            frames.push(data);
            if (totalFrames - currentFrame === 0) {
              console.log("Gif Tanımlaması Tamamlandı");
            }
          }
        );
      } else if (dosya.endsWith(".png")) {
        const p = path.join(klasorYolu, dosya);

        const img = await loadImage(p);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        let data = {};
        data.width = img.width;
        data.height = img.height;
        const d = await canvas.toDataURL("image/png");
        data.data = d;
        frames.push(data);
      }
    }
    const { maxHeight, totalWidth, maxWitdh } = calculateDimensions(frames);

    console.log("En uzun with:", maxHeight);
    console.log("En uzun height:", maxWitdh);
    console.log("Toplam height:", totalWidth);
    json.start_animation = {
      type: "image",
      uv_size: [maxHeight, maxWitdh],
      uv: "@ui_animation.animation",
      texture: "uida/output.png",
    };
    const canvas = createCanvas(maxHeight, totalWidth);
    const ctx = canvas.getContext("2d");
    let x = 0;
    let f = 0;
    for (const frame of frames) {
      const image = await loadImage(frame.data);
      ctx.drawImage(image, 0, x);
      x += frame.height;
      let next = f + 1;
      if (next >= frames.length) next = 0;
      json[`frame${f}@ui_animation.animation`] = {
        $uv_frame: [0, x],
        next: `@ui_animation.frame${next}`,
      };
      f = f + 1;
    }
    const buffer = await canvas.toBuffer("image/png");
    await fs.writeFileSync(path.join(__dirname, "output.png"), buffer);
    console.log("Resim tamamlandı,");
    await fs.writeFileSync(
      path.join(__dirname, "output.json"),
      JSON.stringify(json, null, 2)
    );
    console.log("JSON tamamlandı,");
  });
});
function calculateDimensions(frames) {
  let maxHeight = 0;
  let maxWitdh = 0;
  let totalWidth = 0;

  for (const frame of frames) {
    maxHeight = Math.max(maxHeight, frame.width);
    maxWitdh = Math.max(maxHeight, frame.height);
    totalWidth += frame.height;
  }

  return { maxHeight, totalWidth, maxWitdh };
}
