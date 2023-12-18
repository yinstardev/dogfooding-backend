import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const ts_url = process.env.REACT_APP_TS_URL || '';
const token = process.env.REACT_APP_TOKEN || '';

interface SearchRequest {
  dependent_object_version: string;
  include_auto_created_objects: boolean;
  include_dependent_objects: boolean;
  include_details: boolean;
  include_headers: boolean;
  include_hidden_objects: boolean;
  include_incomplete_objects: boolean;
  include_visualization_headers: boolean;
  record_offset: number;
  record_size: number;
  include_stats: boolean;
  metadata: Array<{
    identifier: string;
    type: string;
  }>;
  include_worksheet_search_assist_data: boolean;
}

export async function makeSearchRequest(requestData: SearchRequest): Promise<any> {
  const apiUrl = `${ts_url}/api/rest/2.0/metadata/search`;

  const accessToken = token;
  console.log('accesstoken', accessToken);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const config: AxiosRequestConfig = {
    headers,
  };

  try {
    const response: AxiosResponse<any> = await axios.post(apiUrl, requestData, config);
    return response.data;
  } catch (error) {
    console.error('Error making search request:', error);
    throw error;
  }
}

const searchRequestData: SearchRequest = {
  dependent_object_version: 'V1',
  include_auto_created_objects: false,
  include_dependent_objects: true,
  include_details: true,
  include_headers: true,
  include_hidden_objects: true,
  include_incomplete_objects: true,
  include_visualization_headers: true,
  record_offset: 0,
  record_size: 10,
  include_stats: false,
  metadata: [
    {
      identifier: '54beb173-d755-42e0-8f73-4d4ec768114f',
      type: 'LOGICAL_TABLE',
    },
  ],
  include_worksheet_search_assist_data: true,
};

const getOperationsForDataType = (dataType: string): string[] => {
  const dataTypeOperations: Record<string, string[]> = {
    VARCHAR: ['EQ', 'NEQ'],
    CHAR: ['EQ', 'NEQ'],
    INT64: ['EQ', 'NEQ', 'LEQ', 'GEQ'],
    DOUBLE: ['EQ', 'NEQ', 'LEQ', 'GEQ'],
    DATE: ['EQ', 'NEQ', 'LT', 'GT'],
    DATE_TIME: ['EQ', 'NEQ', 'LT', 'GT'],
  };
  return dataTypeOperations[dataType] || [];
};

export const getColumns = (rawData: any) => {
  const columns = rawData[0].metadata_detail.columns;
  const columnData = columns.map((col: any) => {
    return {
      name: col.header.name,
      dataType: col.dataType,
    };
  });
  console.log(`column Data : ${columnData}`);
  return columnData;
};

export const getAPIFilterData = async () => {
  // console.log("Inside Handle Axios Request");
  // await makeSearchRequest(searchRequestData)
  // .then((response) => {
  //   console.log('Search response:', response);
  //   const filterData = getColumns(response);
  //   console.log(`This is Column Data inside getAPIFilterData Function : ${JSON.stringify(filterData)}`);
  //   return filterData;
  // })
  // .catch((error) => {
  //   console.error('Error making search request:', error);
  // });

  try {
    console.log('Inside Axios Request');
    const response = await makeSearchRequest(searchRequestData);
    console.log('Search response:', response);
    const filterData = getColumns(response);
    console.log(`This is Column Data inside getAPIFilterData Function : ${JSON.stringify(filterData)}`);
    return filterData;
  } catch (err) {
    console.error('Error making search request:', err);
  }
};
