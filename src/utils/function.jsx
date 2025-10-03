export const renderElement = (result) => {
  if (!result) {
    return null; // If no result, return nothing
  }

  // Map result types to corresponding Tailwind CSS classes
  // const typeToClass = {
  //   success: "bg-green-200 text-green-800",
  //   error: "bg-red-200 text-red-800",
  //   warning: "bg-yellow-200 text-yellow-800",
  //   info: "bg-blue-200 text-blue-800",
  // };

  return (
    // <p className={`text-danger ${typeToClass[result.type]}`}>
    //   {result.msg}
    // </p>
    <p style={{fontSize:'14px'}} className={`text-danger`}>
      {result.msg}
    </p>
  );
};
