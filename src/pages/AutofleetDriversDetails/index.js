import useNewFetch from "../../hooks/use-new-fetch";

const AutofleetDriversDetails = () => {

  const { data, loading, error } = useNewFetch(`/v1/active-drivers?1
  `)
  console.log(data, loading, error)
   


  return (
    <div>
      <h1>AutofleetDriversDetails</h1>
    </div>
  );
};

export default AutofleetDriversDetails;
