import React, {Suspense, useEffect} from "react";
import Typography from "@mui/material/Typography";
import {useParams} from "react-router-dom";

type escrowViewProps = {
  setEscrowAddress: any
}

export default function EscrowDashboardView({
  setEscrowAddress
  }: escrowViewProps)
{
  let {id}: any = useParams();
  // set token address by url instead of t= (check line 80 onwards works in app.tsx for getting the tokenData)
  useEffect(() => {
    setEscrowAddress(id);
  }, []);

  return (
    <>
      <Typography className="black">Hey</Typography>
    </>
  )
}
