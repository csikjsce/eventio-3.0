import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Checkbox,
  Button,
} from "@material-tailwind/react";
 
export  function App() {
  return (
    <Card className="w-96"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
      <CardHeader
        variant="gradient"
        color="gray"
        className="mb-4 grid h-28 place-items-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}      >
        <Typography variant="h3" color="white"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Sign In
        </Typography>
      </CardHeader>
      <CardBody className="flex flex-col gap-4"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <Input label="Email" size="lg" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
        <Input label="Password" size="lg" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
        <div className="-ml-2.5">
          <Checkbox label="Remember Me" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
        </div>
      </CardBody>
      <CardFooter className="pt-0"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <Button variant="gradient" fullWidth  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Sign In
        </Button>
        <Typography variant="small" className="mt-6 flex justify-center"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          Don&apos;t have an account?
          <Typography
            as="a"
            href="#signup"
            variant="small"
            color="blue-gray"
            className="ml-1 font-bold" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}          >
            Sign up
          </Typography>
        </Typography>
      </CardFooter>
    </Card>
  );
}
export default App;