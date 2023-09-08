import { useEffect, useState } from "react";

const KEY = "e0667f68";

const useMovies = (query) => {
  const [movies, setMovies] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");

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
    // handleCloseMovie();
    fetchMovies();
  }, [query]);

  return { movies, isLoding, error };
};

export default useMovies;
