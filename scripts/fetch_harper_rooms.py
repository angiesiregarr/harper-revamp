"""Bundle verified Harper room photos for the hero carousel.

Each URL is a room image on a page for the named property. Keep this list in
the same order as the carousel data so its captions always match the photo.
"""

from pathlib import Path
import subprocess


ROOMS = [
    ('harper-room-01.jpg', 'https://images.trvl-media.com/lodging/7000000/6490000/6481500/6481422/8b2dbad7.jpg?h=800&impolicy=fcrop&quality=medium&w=1200'),
    ('harper-room-02.jpg', 'https://www.kayak.sg/rimg/himg/9c/de/79/expedia_group-803576-3db72074-687522.jpg?crop=true&height=607&width=836'),
    ('harper-room-03.jpg', 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/432389875.jpg?k=adf8376b5bc37a55b81430f70aad09d7316a204e8bbbb4945edfaec4a39cd998&o='),
    ('harper-room-04.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/fb/39/99/deluxe-room.jpg?h=-1&s=1&w=700'),
    ('harper-room-05.jpg', 'https://images.trvl-media.com/lodging/34000000/33240000/33235200/33235182/c4200db3.jpg?h=800&impolicy=fcrop&quality=medium&w=1200'),
    ('harper-room-06.jpg', 'https://bynder.onthebeach.co.uk/cdn-cgi/image/width%3D1400%2Cquality%3D80%2Cfit%3Dcover%2Cformat%3Dauto/m/49d83a403bb4080c/original/Harper-Kuta-Hotel-by-ASTON-Indonesia-BALI-Room-3.jpg'),
    ('harper-room-07.jpg', 'https://images.trvl-media.com/lodging/95000000/94880000/94874600/94874516/e662ad21.jpg?h=800&impolicy=fcrop&quality=medium&w=1200'),
    ('harper-room-08.jpg', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/09/da/89/caption.jpg?h=-1&s=1&w=1200'),
    ('harper-room-09.jpg', 'https://images.trvl-media.com/lodging/16000000/15870000/15868000/15867986/39c10a8b.jpg?h=800&impolicy=fcrop&quality=medium&w=1200'),
    ('harper-room-10.jpg', 'https://ik.imagekit.io/tvlk/generic-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/10016082-5767781ab1e3d7ae98bf5cf441ab0ac7.jpeg?_src=imagekit&tr=c-at_max%2Ch-720%2Cq-40%2Cw-1280'),
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
        if result.returncode or not path.exists() or not path.read_bytes().startswith((b'\xff\xd8\xff', b'\x89PNG')):
            path.unlink(missing_ok=True)
            missing.append(name)
            print(f'Could not fetch {name}: {url}')
        else:
            print(f'Fetched {name}: {path.stat().st_size} bytes')
    print(f'Missing: {", ".join(missing) if missing else "none"}')


if __name__ == '__main__':
    main()
