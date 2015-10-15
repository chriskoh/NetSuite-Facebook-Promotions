/*-------------------------------------------------------------------------------------------------
Function: trim(arr)
Purpose:  remove all duplicated elements in an array
-------------------------------------------------------------------------------------------------*/
function trim(arr)
{
	var i,
	len=arr.length,
	out=[],
	obj={};

	for (i=0;i<len;i++) 
	{
		obj[arr[i]]=0;
	}
	for (i in obj) 
	{
		out.push(i);
	}
	
	return out;
}
