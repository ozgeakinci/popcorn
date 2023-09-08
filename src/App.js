import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const KEY = "e0667f68";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);

  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // const [watched, setWatched] = useState([]);

  const [watched, setWatched] = useState(() => {
    const storeValue = localStorage.getItem("watched");
    const initialWatched = storeValue ? JSON.parse(storeValue) : [];
    return initialWatched;
  });

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

  //Hanfgi filmi seçtiğimizi gösterir

  const handleSelectedId = (id) => {
    setSelectedId(id);
  };

  //Seçtiğimiz filmi back tuşuyla kapatmamızı sağlar
  const handleCloseMovie = () => {
    setSelectedId(null);
  };

  const handleAddMovie = (movie) => {
    setWatched((movies) => [...movies, movie]);
  };

  const handleDeleteWatch = (id) => {
    setWatched((movies) => movies.filter((movie) => movie.imdbID !== id));
  };

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  useEffect(() => {
    //Seach alanından film arattığımızda çok hızlı bir şekilde giriş yaptığımız için veriler çakışır ve veriye ulaşamayız bunun için her istek attıldığında her harf için bir öncekini durdurmak gerekr. Bunun için React ile ilgisi olmayan browser ile ilgili olan AbortController fonksiyonunu kullanırız. ve Bunu datayı çektiğimiz yerden çağırıp en sonundada tekrar sıfırlıyoruz.
    const controller = new AbortController();

    const fetchMovies = async () => {
      try {
        // Loding beklerken çalışması için
        setIsLoding(true);
        // Verileri almaya başlamadan önce her zaman erroru sıfırlıyoruzç
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal } //AbortControlerı bu şekilde obje olarak tanımlıyoruz.
        );

        // Burada eğer response başarılı dönmezse gösterilecek hata mevcut
        if (!res.ok)
          throw new Error("Something went wrong with fetching movies");
        const data = await res.json();
        // Eğer data false döndüyse özellikle loglayıp bu hatayı aldığımızda kendi yönümüze çevirmek için bunu uygulabiliriz.
        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(data.Search);
        // console.log(data.Search);
        setError("");
      } catch (err) {
        // console.error(err.message);
        setError(err.message);

        // AbrortErorü hata olarak yakaladığı için onu ayıklamak görmezden gelmek için
        if (err.name !== "AbortError") {
          setError(err.message);
        }
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
    handleCloseMovie();
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
          {!isLoding && !error && (
            <MovieList movies={movies} onSelectedId={handleSelectedId} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddMovie={handleAddMovie}
              movies={movies}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDelete={handleDeleteWatch}
              />
            </>
          )}
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
  //Normalde bir dom öğresine ulaşmak için useEffect kullanarak aşağıdaki gibi ilerleyebiliriz.
  //Ancak bunun yerine useRef kullanmak çok daha sağlıklıdır.
  // useEffect(() => {
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   el.focus();
  // }, []);

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

const MovieList = ({ movies, onSelectedId }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectedId={onSelectedId} />
      ))}
    </ul>
  );
};

const Movie = ({ movie, onSelectedId }) => {
  return (
    <li onClick={() => onSelectedId(movie.imdbID)}>
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

const MovieDetails = ({ selectedId, onCloseMovie, onAddMovie, watched }) => {
  const [movieDetails, setMovieDetails] = useState({});
  const [isLooding, setIsLoding] = useState(false);
  const [userRating, setUserRating] = useState("");
  //  aynı idli filmin tekrar seçilmemsi adına oluşturuldu
  const isWatched = watched.map((movies) => movies.imdbID).includes(selectedId);
  // Daha önce verdiğimiz puanı seçtiğimiz filimde oluşturmak için
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Actors: actors,
    Director: director,
    Plot: plot,
    Ratings: ratings,
    Poster: poster,
    Released: released,
    Runtime: runtime,
    Genre: genre,
    imdbRating,
  } = movieDetails;

  const [avgRating, setAvgRating] = useState(0);

  const handleAdd = () => {
    const newMovieList = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(imdbRating.slice(" ").at(0)),
      userRating,
    };
    onAddMovie(newMovieList);
    onCloseMovie();

    //Burda imdbRatingi avgRating olarak ayarladık ve başlangıç değerinin 0 olmaması için callback kullandık.
    // setAvgRating(Number(imdbRating));
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);

    // console.log(newMovieList);
  };
  // Escape tuşuya çıkış yapmak için
  useEffect(() => {
    const callback = (e) => {
      if (e.code === "Escape") {
        onCloseMovie();
        // console.log("Closing");
      }
    };
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [onCloseMovie]);

  useEffect(() => {
    const getMovieDetails = async () => {
      setIsLoding(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovieDetails(data);
      setIsLoding(false);
    };

    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    //useEffect içerisinde yan etkiyi sıfırlamak için temizleme fonksiyonu en başa dönüyor
    return () => (document.title = "usePopCorn");
    // console.log(`Clean up effect for movie ${title}`);
  }, [title]);

  return (
    <div className="details">
      {isLooding ? (
        <Loader />
      ) : (
        <>
          <header>
            <div className="details-overview">
              <button className="btn-back" onClick={() => onCloseMovie()}>
                &larr;
              </button>
              <img src={poster} alt={`Poster of ${movieDetails}`} />
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating}
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            {/* <p>{avgRating}</p> */}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring{actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
};

const WatchedMoviesList = ({ watched, onDelete }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDelete={onDelete} />
      ))}
    </ul>
  );
};

const WatchedMovie = ({ movie, onDelete }) => {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
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

        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
};
