import fs from 'fs';

interface TrackInfo {
  track_id: number;
  track_name: string;
  config_name: string;
}

export const generateSvgComponents = () => {
  const order = [
    'background',
    'inactive',
    'active',
    'pitroad',
    'turns',
    'start-finish',
  ];
  const tracks = fs.readdirSync(`./asset-data`);
  const trackInfoString = fs.readFileSync(
    './asset-data/track-info.json',
    'utf8'
  );
  const trackInfo: TrackInfo[] = JSON.parse(trackInfoString);

  tracks.forEach((trackId) => {
    // check if its a folder
    if (!fs.lstatSync(`./asset-data/${trackId}`).isDirectory()) {
      return;
    }
    generateCombinedSvg(trackId);
  });

  function generateCombinedSvg(trackId: string) {
    const track = trackInfo.find((t) => t.track_id === +trackId);
    if (!track) {
      console.error(`No track info found for ${trackId}`);
      return;
    }
    const svgComponents = fs
      .readdirSync(`./asset-data/${trackId}`)
      .sort(
        (a, b) =>
          order.indexOf(a.replace('.svg', '')) -
          order.indexOf(b.replace('.svg', ''))
      )
      .filter((file) => file.endsWith('.svg'))
      .map((file) => {
        const svgContent = fs.readFileSync(
          `./asset-data/${trackId}/${file}`,
          'utf8'
        );
        return { file, svgContent };
      })
      .map(({ file, svgContent }) => {
        // for each svg file remove <svg ...> and </svg> tags and make each svg a <g> element with an id
        const id = `${file.replace('.svg', '')}`;
        let opacity = '';
        if (id === 'background') opacity = 'opacity="0.1"';
        if (id === 'inactive') opacity = 'opacity="0.2"';

        const svgContentWithoutSvgTags =
          `<g class="${id}" ${opacity}>${svgContent
            .replace(/<\?xml.*?\?>/, '')
            .replace(/<svg[^>]*>/s, '')
            .replace('</svg>', '')}</g>`
            .replaceAll('.st', `.${id} .st`)
            .replaceAll('.cls', `.${id} .cls`);
        return svgContentWithoutSvgTags;
      })
      .join('\n\n');

    // wrap with svg tags;
    const svg = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1920 1080" xml:space="preserve">
  <title>${track.track_name}</title>
  ${svgComponents}

  <!-- Used for tracking vehicle position -->
  <g class="generated-inside-path">
    <path fill="none"/>
  </g>
  <g class="car-indicator">
    <circle r="30" />
  </g>
</svg>
`;

    console.log(
      `Generated ${trackId}.svg - ${track.track_name} - ${track.config_name}`
    );
    // format and save
    fs.writeFileSync(
      `./src/widgets/components/TrackMap/tracks/${trackId}.svg`,
      svg,
      'utf8'
    );
  }
};
