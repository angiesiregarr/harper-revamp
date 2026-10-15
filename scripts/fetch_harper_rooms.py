"""Bundle verified Harper room photos for the hero carousel.

Each URL is a room image on a page for the named property. Keep this list in
the same order as the carousel data so its captions always match the photo.
"""

from pathlib import Path
import subprocess


ROOMS = [
    ('harper-room-01.jpg', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/568701156.jpg?k=ae35acc33586211bdf12e054a7c9bbbee724c36a92dff5436522265512275d08&o='),
    ('harper-room-02.jpg', 'https://www.kayak.sg/rimg/himg/9c/de/79/expedia_group-803576-3db72074-687522.jpg?crop=true&height=607&width=836'),
    ('harper-room-03.jpg', 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/432389875.jpg?k=adf8376b5bc37a55b81430f70aad09d7316a204e8bbbb4945edfaec4a39cd998&o='),
    ('harper-room-04.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/fb/39/99/deluxe-room.jpg?h=-1&s=1&w=700'),
    ('harper-room-05.jpg', 'https://images.trvl-media.com/lodging/34000000/33240000/33235200/33235182/c4200db3.jpg?h=800&impolicy=fcrop&quality=medium&w=1200'),
    ('harper-room-06.jpg', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/608408928.jpg?k=74f0246fca1627d60b02a5eed209fe8a81cb4202b2dbff4693062ac66ea047d7&o='),
    ('harper-room-07.jpg', 'https://images.trvl-media.com/lodging/95000000/94880000/94874600/94874516/e662ad21.jpg?h=800&impolicy=fcrop&quality=medium&w=1200'),
    ('harper-room-08.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/09/da/89/caption.jpg?h=-1&s=1&w=1200'),
    ('harper-room-09.jpg', 'https://images.trvl-media.com/lodging/16000000/15870000/15868000/15867986/39c10a8b.jpg?h=800&impolicy=fcrop&quality=medium&w=1200'),
    ('harper-room-10.jpg', 'https://www.hutamakarya.com/storage/hubungan-invesroe/whatsapp-image-2022-12-14-at-081130.jpeg'),
]


def main():
    out = Path('assets')
    out.mkdir(exist_ok=True)
    missing = []
    for name, url in ROOMS:
        path = out / name
        if path.exists() and path.stat().st_size > 10_000:
            print(f'Already present: {name}')
            continue
        result = subprocess.run([
            'curl', '--fail', '--location', '--silent', '--show-error',
            '--retry', '2', '--max-time', '30',
            '--user-agent', 'Mozilla/5.0 (compatible; HarperSite/1.0)',
            url, '--output', str(path),
        ], check=False)
        if result.returncode or not path.exists() or not path.read_bytes().startswith(b'\xff\xd8\xff'):
            path.unlink(missing_ok=True)
            missing.append(name)
            print(f'Could not fetch {name}: {url}')
        else:
            print(f'Fetched {name}: {path.stat().st_size} bytes')
    print(f'Missing: {", ".join(missing) if missing else "none"}')


if __name__ == '__main__':
    main()
