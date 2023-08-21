import { useEffect, useState } from "react";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];
const KEY = "e0667f68";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");
  const tempQuery = "godfather";
  //useEffek kullanımı test
  // useEffect(() => {
  //   console.log("Bağımlılığı olmadığından her renderda çalışır");
  // });

  // useEffect(() => {
  //   console.log("Bir kez çalışır ancak farklı bir bağımlılık varsa çalışmaz");
  // }, []);

  // console.log("ilk çalışır");

  // useEffect(() => {
  //   console.log(
  //     "Seach kısmı querye bağlı olduğundan o kısma birşeyler girmeye çalışırsak çalışır."
  //   );
  // }, [query]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Loding beklerken çalışması için
        setIsLoding(true);
        // Verileri almaya başlamadan önce her zaman erroru sıfırlıyoruzç
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
        );

        // Burada eğer response başarılı dönmezse gösterilecek hata mevcut
        if (!res.ok)
          throw new Error("Something went wrong with fetching movies");
        const data = await res.json();
        // Eğer data false döndüyse özellikle loglayıp bu hatayı aldığımızda kendi yönümüze çevirmek için bunu uygulabiliriz.
        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(data.Search);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setIsLoding(false);
      }
    };

    // Burada fonksiyonu çalıştırmadan önce ekranda movie not found yazmaması için çünkü fonksiyon birşey yazmasakta çalışır ve boş array olduğundan not found uyarısı alırız
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    fetchMovies();
  }, [query]);

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </Navbar>
      <Main>
        {/*  V2 element versiyon
       <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        /> */}
        {/* V1 children kullanılan versiyon prop olarak */}
        <Box>
          {/* Burası sadece loding gösterir. Bizim istediğimiz error mesajınıda almak o zaman yeniden tanımlayacağız. */}
          {/* {isLoding ? <Loader /> : <MovieList movies={movies} />} */}

          {isLoding && <Loader />}
          {!isLoding && !error && <MovieList movies={movies} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </Box>
      </Main>
    </>
  );
}
const Navbar = ({ children }) => {
  return <nav className="nav-bar">{children}</nav>;
};

const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};

const Loader = () => {
  return <p className="loader"> Loading...</p>;
};

const ErrorMessage = ({ message }) => {
  return (
    <p className="error">
      <span className="error"> ⛔️ {message}</span>
    </p>
  );
};

const NumResult = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
};
const Search = ({ query, setQuery }) => {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};

// V2 Element kullanılan versiyon
// const Box = ({ element }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   return (
//     <div className="box">
//       <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
//         {isOpen ? "–" : "+"}
//       </button>
//       {isOpen && element}
//     </div>
//   );
// };

// V1 children kullanılan versiyonu en çok kullanılan versiyon
const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box scrollable-content">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};
// Önceki list box ile aynı olduğu için yeniden kullanılabilir bir Box yaratıldı.
// const WatchedBox = () => {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && <WatchedSummary watched={watched} />}
//       <WatchedMoviesList watched={watched} />}
//     </div>
//   );
// };

const MovieList = ({ movies }) => {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
};

const Movie = ({ movie }) => {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
};

const WatchedSummary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
};

const WatchedMoviesList = ({ watched }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
};

const WatchedMovie = ({ movie }) => {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
};
