export interface PageSettings {
  username: string;
  pageName: string;
  pageUrl: string;
  isPublic: boolean;
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
  qrText: string;
  qrColors: {
    frame: string;
    glyph: string;
    background: string;
    accent: string;
  };
}

export const defaultPageSettings: PageSettings = {
  username: 'username',
  pageName: 'Главная страница',
  pageUrl: 'https://biohub.pro/username',
  isPublic: true,
  seoTitle: 'username at BioHub',
  seoDescription: '',
  noIndex: false,
  qrText: 'ОТСКАНИРУЙ МЕНЯ',
  qrColors: {
    frame: '#1f1f25',
    glyph: '#fefefe',
    background: '#05070f',
    accent: '#3d82f2',
  },
};

