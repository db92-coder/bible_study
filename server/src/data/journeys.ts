export interface JourneyStop {
  name: string;
  lat: number;
  lon: number;
}

export interface Journey {
  name: string;
  color: string;
  refs: string;
  stops: JourneyStop[];
}

// Author/subject journeys drawn on the map for the book being read.
// Coordinates follow the OpenBible.info geocoding data (traditional sites).
export const JOURNEYS_BY_BOOK: Record<string, Journey[]> = {
  Genesis: [
    {
      name: "Abraham's journey to Canaan",
      color: '#b48a3c',
      refs: 'Genesis 11:31–13:18',
      stops: [
        { name: 'Ur of the Chaldeans', lat: 30.9626, lon: 46.1031 },
        { name: 'Haran', lat: 36.8646, lon: 39.0316 },
        { name: 'Shechem', lat: 32.2137, lon: 35.2819 },
        { name: 'Bethel', lat: 31.9308, lon: 35.2203 },
        { name: 'Negev', lat: 30.8, lon: 34.8 },
        { name: 'Egypt', lat: 30.5, lon: 31.2 },
        { name: 'Bethel', lat: 31.9308, lon: 35.2203 },
        { name: 'Hebron (Mamre)', lat: 31.5326, lon: 35.0998 },
      ],
    },
  ],
  Exodus: [
    {
      name: 'The Exodus from Egypt to Sinai',
      color: '#2f6f6a',
      refs: 'Exodus 12–19',
      stops: [
        { name: 'Rameses', lat: 30.7994, lon: 31.8214 },
        { name: 'Succoth', lat: 30.55, lon: 32.0 },
        { name: 'Pi-hahiroth (Red Sea crossing)', lat: 30.0, lon: 32.55 },
        { name: 'Marah', lat: 29.65, lon: 32.85 },
        { name: 'Elim', lat: 29.35, lon: 32.95 },
        { name: 'Rephidim', lat: 28.75, lon: 33.55 },
        { name: 'Mount Sinai', lat: 28.5394, lon: 33.9737 },
      ],
    },
  ],
  Numbers: [
    {
      name: 'Wilderness wanderings: Sinai to Moab',
      color: '#2f6f6a',
      refs: 'Numbers 10–33',
      stops: [
        { name: 'Mount Sinai', lat: 28.5394, lon: 33.9737 },
        { name: 'Kadesh-barnea', lat: 30.6875, lon: 34.4926 },
        { name: 'Mount Hor', lat: 30.3172, lon: 35.4074 },
        { name: 'Ezion-geber', lat: 29.5455, lon: 34.9721 },
        { name: 'Plains of Moab', lat: 31.83, lon: 35.65 },
      ],
    },
  ],
  Acts: [
    {
      name: "Paul's first missionary journey",
      color: '#b48a3c',
      refs: 'Acts 13–14',
      stops: [
        { name: 'Antioch (Syria)', lat: 36.2, lon: 36.15 },
        { name: 'Seleucia', lat: 36.12, lon: 35.93 },
        { name: 'Salamis', lat: 35.18, lon: 33.9 },
        { name: 'Paphos', lat: 34.7554, lon: 32.4066 },
        { name: 'Perga', lat: 36.9612, lon: 30.8538 },
        { name: 'Antioch of Pisidia', lat: 38.3061, lon: 31.189 },
        { name: 'Iconium', lat: 37.8714, lon: 32.4847 },
        { name: 'Lystra', lat: 37.5786, lon: 32.4539 },
        { name: 'Derbe', lat: 37.35, lon: 33.35 },
        { name: 'Attalia', lat: 36.8841, lon: 30.7056 },
        { name: 'Antioch (Syria)', lat: 36.2, lon: 36.15 },
      ],
    },
    {
      name: "Paul's second missionary journey",
      color: '#2f6f6a',
      refs: 'Acts 15:36–18:22',
      stops: [
        { name: 'Antioch (Syria)', lat: 36.2, lon: 36.15 },
        { name: 'Tarsus', lat: 36.9177, lon: 34.8949 },
        { name: 'Derbe', lat: 37.35, lon: 33.35 },
        { name: 'Lystra', lat: 37.5786, lon: 32.4539 },
        { name: 'Iconium', lat: 37.8714, lon: 32.4847 },
        { name: 'Troas', lat: 39.7526, lon: 26.159 },
        { name: 'Philippi', lat: 41.0136, lon: 24.2886 },
        { name: 'Thessalonica', lat: 40.6403, lon: 22.9439 },
        { name: 'Berea', lat: 40.5242, lon: 22.2044 },
        { name: 'Athens', lat: 37.9756, lon: 23.7348 },
        { name: 'Corinth', lat: 37.9057, lon: 22.8802 },
        { name: 'Ephesus', lat: 37.9411, lon: 27.342 },
        { name: 'Caesarea', lat: 32.4988, lon: 34.8903 },
        { name: 'Jerusalem', lat: 31.7767, lon: 35.2342 },
        { name: 'Antioch (Syria)', lat: 36.2, lon: 36.15 },
      ],
    },
    {
      name: "Paul's third missionary journey",
      color: '#7a4a8b',
      refs: 'Acts 18:23–21:17',
      stops: [
        { name: 'Antioch (Syria)', lat: 36.2, lon: 36.15 },
        { name: 'Tarsus', lat: 36.9177, lon: 34.8949 },
        { name: 'Ephesus', lat: 37.9411, lon: 27.342 },
        { name: 'Troas', lat: 39.7526, lon: 26.159 },
        { name: 'Philippi', lat: 41.0136, lon: 24.2886 },
        { name: 'Corinth', lat: 37.9057, lon: 22.8802 },
        { name: 'Miletus', lat: 37.5303, lon: 27.2762 },
        { name: 'Tyre', lat: 33.2704, lon: 35.2038 },
        { name: 'Caesarea', lat: 32.4988, lon: 34.8903 },
        { name: 'Jerusalem', lat: 31.7767, lon: 35.2342 },
      ],
    },
    {
      name: "Paul's voyage to Rome",
      color: '#8b3a3a',
      refs: 'Acts 27–28',
      stops: [
        { name: 'Caesarea', lat: 32.4988, lon: 34.8903 },
        { name: 'Sidon', lat: 33.5606, lon: 35.3758 },
        { name: 'Myra', lat: 36.2599, lon: 29.9852 },
        { name: 'Fair Havens (Crete)', lat: 34.9333, lon: 24.8 },
        { name: 'Malta', lat: 35.9, lon: 14.4167 },
        { name: 'Syracuse', lat: 37.0692, lon: 15.2875 },
        { name: 'Rhegium', lat: 38.1105, lon: 15.6613 },
        { name: 'Puteoli', lat: 40.8262, lon: 14.1214 },
        { name: 'Rome', lat: 41.8919, lon: 12.5113 },
      ],
    },
  ],
};
