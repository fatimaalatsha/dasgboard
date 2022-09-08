import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import Document from '../Document' // Import Document component

const DriverDocument = ({ id, sub }) => {
  const { data, isLoading, error } = useFetch(`/v1/documents/cc/drivers/${id}`)// Call useFetch custom hook

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error...</div>
  }

  return (
    <>
    {
      data.items.map((item, index) => (
        <Document key={index} data={item} sub={sub} />
      ))
    }
    </>
  )

}

export default DriverDocument