from PIL import Image

src = r"C:\Users\rayan\Documents\GitHub\lodestar\logo.png"
out = r"C:\Users\rayan\Documents\GitHub\lodestar"

img = Image.open(src).convert("RGBA")
print(f"Source: {img.size} {img.mode}")

img16 = img.resize((16, 16), Image.LANCZOS)
img16.save(f"{out}/favicon-16x16.png")

img32 = img.resize((32, 32), Image.LANCZOS)
img32.save(f"{out}/favicon-32x32.png")

img180 = img.resize((180, 180), Image.LANCZOS)
img180.save(f"{out}/apple-touch-icon.png")

img.save(f"{out}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32)])

print("Generated: favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, favicon.ico")
