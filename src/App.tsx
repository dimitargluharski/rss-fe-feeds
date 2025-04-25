import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const categorizedFeeds = {
  'CSS & Design': [
    { name: 'CSS-Tricks', url: import.meta.env.VITE_CSS_TRICKS },
    { name: 'Codrops', url: import.meta.env.VITE_CODROPS },
  ],
  'JavaScript & Frontend Development': [
    { name: 'DEV.to Frontend', url: import.meta.env.VITE_DEV_TO_FRONTEND },
    { name: 'Frontend Focus', url: import.meta.env.VITE_FRONTEND_FOCUS },
    { name: 'Echo JS', url: import.meta.env.VITE_ECHO_JS },
  ],
  'Web Development News': [
    { name: 'Smashing Magazine', url: import.meta.env.VITE_SMASHING_MAGAZINE },
    { name: 'FreeCodeCamp', url: import.meta.env.VITE_FREECODECAMP },
    { name: 'HackerNoon Frontend', url: import.meta.env.VITE_HACKERNOON_FRONTEND },
  ],
};

type FeedItem = {
  link: string;
  title: string;
  pubDate: string;
};

type FeedSource = {
  source: string;
  items: FeedItem[];
};

type Feeds = {
  [category: string]: FeedSource[];
};

const App = () => {
  const [feeds, setFeeds] = useState<Feeds>({});
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<FeedItem[]>([]);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const categories = Object.entries(categorizedFeeds);
        const feedData: Feeds = {};

        for (const [category, sources] of categories) {
          const requests = sources.map(source =>
            fetch(`${API_URL}?rss_url=${encodeURIComponent(source.url)}`)
              .then(res => res.json())
              .then(data => ({
                source: source.name,
                items: data.items.slice(0, 10),
              }))
          );

          feedData[category] = await Promise.all(requests);
        }

        setFeeds(feedData);
      } catch (error) {
        console.error('Fetching error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  const toggleBookmark = (item: FeedItem) => {
    const isBookmarked = bookmarks.some(bookmark => bookmark.link === item.link);

    let updatedBookmarks;
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter(bookmark => bookmark.link !== item.link);
    } else {
      updatedBookmarks = [...bookmarks, item];
    }

    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  };

  const isBookmarked = (link: string) => {
    return bookmarks.some(bookmark => bookmark.link === link);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600">Loading feeds...</div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen p-6">
      <header className="mb-8 w-full">
        <h1 className="text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Frontend RSS Feeder
        </h1>
      </header>

      {bookmarks.length > 0 && (
        <div className="max-w-4xl mx-auto mb-12 bg-white border border-yellow-300 shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-600 mb-4 ">⭐️ Bookmarked Articles</h2>
          <ul className="space-y-3">
            {bookmarks.map((item) => (
              <li key={item.link} className="flex justify-between items-start">
                <div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-indigo-600 transition duration-200"
                  >
                    {item.title}
                  </a>
                  <p className="text-xs text-gray-400">
                    {new Date(item.pubDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleBookmark(item)}
                  className="text-yellow-500 ml-2 text-xl hover:cursor-pointer"
                  title="Remove bookmark"
                >
                  ★
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(feeds).map(([category, feedSources]) => (
          <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-indigo-600 text-white px-4 py-2 text-lg font-semibold">
              {category}
            </div>
            <div className="p-4">
              {feedSources.map((source) => (
                <div key={source.source} className="mb-4">
                  <h3 className="text-indigo-500 font-bold mb-2">{source.source}</h3>
                  <ul className="space-y-2">
                    {source.items.map((item) => (
                      <li key={item.link} className="flex justify-between items-start">
                        <div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-indigo-600 transition duration-200"
                          >
                            {item.title}
                          </a>
                          <p className="text-xs text-gray-400">
                            {new Date(item.pubDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleBookmark(item)}
                          className="text-yellow-500 ml-2 text-xl hover:cursor-pointer"
                          title={isBookmarked(item.link) ? 'Remove bookmark' : 'Add to bookmarks'}
                        >
                          {isBookmarked(item.link) ? '★' : '☆'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>



      <footer className="text-center mt-12 text-sm text-gray-500">
        Made with ❤️ and React
      </footer>
    </div>
  );
};

export default App;
