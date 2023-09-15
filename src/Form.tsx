const Form = () => {
  return (
    <form action="/" method="POST" className="w-full max-w-4xl">
      <label htmlFor="url" class="font-bold text-slate-800">
        Url to shorten:
      </label>
      <div className="flex gap-2">
        <input
          className="border border-slate-400 rounded block grow p-2"
          type="text"
          name="url"
        />
        <input
          type="submit"
          value="Submit"
          class=" font-bold text-white bg-cyan-900 rounded px-4"
        />
      </div>
    </form>
  );
};

export default Form;
