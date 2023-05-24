import { useMemo } from "react"
import Table from "./Table"

// Wrapper component around Table component to make it suitable for showing route API data
function RouteTable({data}) {
    const columns = useMemo(
      () => [
        {
          Header: 'LatLng',
          columns: [
            {
                Header: 'ID',
                accessor: 'id',
            },
            {
              Header: 'Origin',
              accessor: 'originTableDisplay',
            },
            {
              Header: 'Destination',
              accessor: 'destinationTableDisplay',
            },
          ],
        },
        {
          Header: 'Time (mins)',
          columns: [
            {
              Header: 'Google Route API',
              accessor: 'googleDuration',
            },
            {
              Header: 'HERE API',
              accessor: 'hereDuration',
            },
          ],
        },
        {
          Header: 'Distance (km)',
          columns: [
            {
              Header: 'Google Route API',
              accessor: 'googleDistance',
            },
            {
              Header: 'HERE API',
              accessor: 'hereDistance',
            },
          ],
        },
      ],
      []
    )

    return (
        <Table columns={columns} data={data} />
    )
}

export default RouteTable